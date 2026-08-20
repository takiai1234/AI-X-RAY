"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Landing from "@/components/Landing";
import PersonaLanding from "@/components/PersonaLanding";
import Assessment from "@/components/Assessment";
import Analyzing from "@/components/Analyzing";
import LeadGate from "@/components/LeadGate";
import Report from "@/components/Report";
import AgentDemo from "@/components/AgentDemo";
import Roadmap from "@/components/Roadmap";
import { computeScore, computeSavings, computeLeadScore } from "@/lib/scoring";
import { track, getSessionId } from "@/lib/tracking";
import type {
  AssessmentAnswers,
  FunnelStep,
  Lead,
  PersonaId,
  PublicSettings,
} from "@/lib/types";

// Customer Journey 10 bước (mục 6):
// landing → assessment → analyzing → lead_gate → report → agent_demo → roadmap
// personaLock: dùng cho landing riêng theo tệp (/ceo, /seller...) — bỏ bước chọn nhóm.
// settings: nội dung chỉnh từ /admin (hero, hook, link khóa, đơn giá giờ).
export default function Funnel({
  personaLock,
  settings,
}: {
  personaLock?: PersonaId;
  settings: PublicSettings;
}) {
  const [step, setStep] = useState<FunnelStep>("landing");
  const [persona, setPersona] = useState<PersonaId>(personaLock ?? "office");
  const [answers, setAnswers] = useState<AssessmentAnswers | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const behavior = useRef({ demoDone: false, roadmapViewed: false, offerClicked: false });

  useEffect(() => {
    track("landing_view", personaLock ? { persona: personaLock } : {});
  }, [personaLock]);

  const score = useMemo(() => (answers ? computeScore(answers) : null), [answers]);
  const savings = useMemo(
    () =>
      answers
        ? computeSavings(answers, answers.hourlyRateSelf || settings.hourlyRate)
        : null,
    [answers, settings.hourlyRate],
  );

  const buildLeadPayload = (
    l: Lead,
    stage: string,
  ): Record<string, unknown> | null => {
    if (!answers || !score) return null;
    return {
      session_id: getSessionId(),
      stage,
      lead: l,
      answers,
      ai_score: score.score,
      ai_level: score.level,
      ai_level_name: score.levelName,
      gaps: score.gaps,
      saved_hours_per_month: savings?.totalSavedHours,
      opportunity_vnd_per_month: savings?.moneyPerMonth,
      lead_score: computeLeadScore(answers, score.score, behavior.current),
      behavior: { ...behavior.current },
      landing: personaLock ? `/${personaLock}` : "/",
      utm: Object.fromEntries(
        new URLSearchParams(window.location.search).entries(),
      ),
    };
  };

  const sendLead = (l: Lead, stage: string) => {
    const payload = buildLeadPayload(l, stage);
    if (!payload) return;
    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  };

  const startAssessment = (p: PersonaId) => {
    setPersona(p);
    setStep("assessment");
    track("assessment_start", { persona: p });
  };

  return (
    <main className="min-h-screen">
      {step === "landing" &&
        (personaLock ? (
          <PersonaLanding
            persona={personaLock}
            hookOverride={settings.personaHooks[personaLock]}
            onStart={() => startAssessment(personaLock)}
          />
        ) : (
          <Landing
            onStart={startAssessment}
            heroTitle={settings.content.heroTitle}
            heroSubtitle={settings.content.heroSubtitle}
          />
        ))}

      {step === "assessment" && (
        <Assessment
          persona={persona}
          onBack={() => setStep("landing")}
          onComplete={(a) => {
            setAnswers(a);
            setStep("analyzing");
            track("assessment_complete", { persona: a.persona });
          }}
        />
      )}

      {step === "analyzing" && <Analyzing onDone={() => setStep("lead_gate")} />}

      {step === "lead_gate" && score && (
        <LeadGate
          score={score.score}
          onSubmit={(l) => {
            setLead(l);
            setStep("report");
            track("lead_submit", { persona, has_email: !!l.email });
            track("report_view", { persona, score: score.score });
            sendLead(l, "lead_submit");
          }}
        />
      )}

      {step === "report" && answers && score && savings && (
        <Report
          answers={answers}
          score={score}
          savings={savings}
          onTryAgent={() => setStep("agent_demo")}
        />
      )}

      {step === "agent_demo" && answers && (
        <AgentDemo
          persona={persona}
          onDone={() => {
            behavior.current.demoDone = true;
            behavior.current.roadmapViewed = true;
            setStep("roadmap");
            track("roadmap_view", { persona });
            if (lead) sendLead(lead, "roadmap_view");
          }}
        />
      )}

      {step === "roadmap" && answers && score && savings && (
        <Roadmap
          answers={answers}
          score={score}
          savings={savings}
          leadName={lead?.name ?? ""}
          courseUrls={settings.courseUrls}
          onOfferClick={() => {
            behavior.current.offerClicked = true;
            if (lead) sendLead(lead, "offer_click");
          }}
        />
      )}
    </main>
  );
}
