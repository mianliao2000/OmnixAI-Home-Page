import React from "react";
import { OrbitalBrandLogo } from "./Brand";
import { uiText, type UiLanguage } from "./i18n";

export function InvestorLandingPage({
  language,
}: {
  language: UiLanguage;
}) {
  const landingRef = React.useRef<HTMLDivElement | null>(null);
  const [activeScene, setActiveScene] = React.useState(0);

  React.useEffect(() => {
    const landing = landingRef.current;
    const scroller = landing?.closest<HTMLElement>(".storyMain");
    if (!landing || !scroller) return undefined;
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const available = Math.max(1, landing.scrollHeight - scroller.clientHeight);
      const progress = Math.min(1, Math.max(0, scroller.scrollTop / available));
      landing.style.setProperty("--landing-progress", progress.toFixed(4));
      const nextScene = progress < 0.28 ? 0 : progress < 0.66 ? 1 : 2;
      setActiveScene((current) => current === nextScene ? current : nextScene);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };
    updateProgress();
    scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      scroller.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const storyScenes = [
    [uiText(language, "Requirements", "需求"), uiText(language, "to system architecture", "抵达系统架构")],
    [uiText(language, "One system", "一套系统"), uiText(language, "Design Verify Test", "设计 验证 测试")],
  ];

  return (
    <div ref={landingRef} className={`investorLanding landing-scene-${activeScene}`}>
      <section className="landingHero console-hidden" aria-label={uiText(language, "Omnix AI product story", "Omnix AI 产品故事")}>
        <div className="landingHeroMedia" aria-hidden="true" />
        <div className="landingHeroDepthLayer" aria-hidden="true" />
        <div className="landingHeroGrid" aria-hidden="true" />
        <div className="landingHeroScan" aria-hidden="true" />
        <div className="landingHeroShade" aria-hidden="true" />
        <div className="landingHeroCopy">
          <span className="landingEyebrow">{uiText(language, "AI-Native Hardware Platform", "AI 原生硬件平台")}</span>
          <h1>
            <span className="landingHeroWordmark">
              <OrbitalBrandLogo surface="dark" />
            </span>
            <em>{uiText(language, "Redefine Hardware Design", "重新定义硬件设计")}</em>
          </h1>
        </div>
        <div className="landingStoryScenes" aria-live="polite">
          {storyScenes.map(([title, subtitle], index) => (
            <div key={title} className={`landingStoryScene ${activeScene === index + 1 ? "active" : ""}`} aria-hidden={activeScene !== index + 1}>
              <h2>{title}<em>{subtitle}</em></h2>
            </div>
          ))}
        </div>
        <div className="landingScrollProgress" aria-hidden="true">
          <i />
          {[0, 1, 2].map((scene) => <b key={scene} className={scene <= activeScene ? "active" : ""} />)}
        </div>
        <div className="landingScrollCue" aria-hidden="true">
          <span>{uiText(language, "Scroll to explore", "向下滚动探索")}</span><i />
        </div>
      </section>

      <footer className="landingFooter">
        {uiText(language, "© 2026 Omnix AI. All rights reserved.", "© 2026 Omnix AI。保留所有权利。")}
      </footer>
    </div>
  );
}
