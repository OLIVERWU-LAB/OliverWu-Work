// Shared by the static Work build and the local cover-motion preview.
(() => {
  const intros = {
    "tencent-cloud-gaming": ["Cloud game discovery, launch and device connection for smart cockpits.", "为智能座舱设计云游戏发现、启动与设备连接。"],
    "adaptive-app-market": ["An app marketplace that adapts to phones, tablets and handhelds.", "适配手机、平板与掌机的系统级应用商店。"],
    "animula-nook-ugc": ["A cross-device hub to discover, join and create party rooms and streams.", "跨端发现、加入与创建派对房和直播间。"],
    "start-cloud-gaming-3": ["Cloud gaming UI across PC, handheld, TV, mobile and web.", "覆盖电脑、掌机、电视、手机与网页的云游戏界面。"],
    "spirited-expedition": ["Bullet-hell combat and Guardian progression in a Wild Rift event.", "融合弹幕战斗与守护者成长的英雄联盟手游活动。"],
    "gangstar-bite-me": ["A permanent bluffing card game played on a crocodile’s teeth.", "以鳄鱼牙齿为牌桌的常驻诈唬卡牌玩法。"],
    "dnf-zhulang-festival": ["Two linked island mini-games pair idle management with card exploration.", "串联放置经营与路线卡牌冒险的两款海岛小游戏。"],
    "poka-project-p": ["A solarpunk open-world RPG concept set among high-altitude settlements.", "以高海拔聚落为背景的太阳朋克开放世界游戏概念。"],
    "olive-town": ["Modular architecture and digital services support a community beneath a viaduct.", "以模块化建筑和数字服务支持无家可归者的桥下社区。"],
    "visual-editor": ["An in-page editor for refining AI-built interfaces and saving real CSS.", "在网页内可视化调整 AI 生成的界面并保存 CSS。"],
    "florahaven": ["An Apple Vision Pro companion for caring for plants in everyday spaces.", "为 Apple Vision Pro 设计的混合现实植物养护助手。"],
    "external-blood-vessel": ["A wireless MIDI glove that turns hand gestures into music.", "把手势转化为音符、和弦与鼓点的无线 MIDI 手套。"],
    "water-babies": ["An installation where visitors’ voices and presence shape fluid imagery, light and sound.", "将观众的声音与活动转化为流体影像、灯光和声响。"],
    "utopia-2419": ["A branching dystopian story with AI-assisted illustrations and an original score.", "结合 AI 辅助插画与原创配乐的反乌托邦分支叙事。"],
    "cloud-island-device": ["A speculative urban system that uses artificial clouds to clean polluted air.", "用人造云净化城市空气的概念设计。"],
    "swrd": ["An underwater VR meditation pairing music with synchronized sound frequencies.", "将音乐与双频声响融入水下场景的 VR 冥想体验。"],
    "sound-design": ["Seven projects spanning original music, interactive sound and immersive environments.", "七个声音项目，涵盖原创音乐、交互音效与沉浸声场。"],
  };

  window.setupWorkCardPreviews = ({ cards, projectCardMap, openProject, hoverQuery, reduceMotionQuery }) => {
    const workPreviewLayer = document.querySelector("#workPreviewLayer");
    const workCardPreviews = new Map();
    const introElements = new Map();
    let previewedWorkCard = null;
    let scrollCheckFrame = 0;
    let pointerX = -1;
    let pointerY = -1;

    for (const card of cards) {
      const copy = intros[card.dataset.projectId];
      const details = card.querySelector(".case-info > .case-details");
      if (!copy || !details) continue;

      card.dataset.workPreview = "";
      const intro = document.createElement("p");
      intro.className = "case-intro";
      intro.id = `work-intro-${card.dataset.projectId}`;
      intro.textContent = copy[0];
      details.before(intro);
      card.setAttribute("aria-describedby", intro.id);
      introElements.set(intro, copy);
    }

    function removeWorkCardPreview(card) {
      const preview = workCardPreviews.get(card);
      clearTimeout(preview.removeTimer);
      preview.panel.remove();
      workCardPreviews.delete(card);
    }

    function collapseWorkCardPreview() {
      if (!previewedWorkCard) return;
      const card = previewedWorkCard;
      previewedWorkCard = null;
      card.classList.remove("is-work-previewing");
      const preview = workCardPreviews.get(card);
      preview.panel.classList.remove("is-expanded");

      if (reduceMotionQuery.matches) {
        removeWorkCardPreview(card);
      } else {
        // Keep the outgoing panel mounted through its 280ms transition.
        preview.removeTimer = window.setTimeout(() => removeWorkCardPreview(card), 340);
      }
    }

    function closeWorkCardPreview() {
      cancelAnimationFrame(scrollCheckFrame);
      scrollCheckFrame = 0;
      previewedWorkCard?.classList.remove("is-work-previewing");
      previewedWorkCard = null;
      workCardPreviews.forEach((_, card) => removeWorkCardPreview(card));
    }

    function mountWorkCardPreview(card, info, intro) {
      const rect = info.getBoundingClientRect();
      const layerRect = workPreviewLayer.getBoundingClientRect();
      const infoStyle = getComputedStyle(info);
      const details = info.querySelector(".case-details");
      const bottomInset = rect.bottom - details.getBoundingClientRect().bottom;
      const panel = document.createElement("div");
      panel.className = "case-info work-info-preview";
      panel.dataset.previewFor = card.dataset.projectId;
      panel.append(...[...info.children].map((child) => {
        const copy = child.cloneNode(true);
        if (child !== intro) return copy;

        const reveal = document.createElement("div");
        reveal.className = "work-info-intro";
        const clip = document.createElement("div");
        copy.removeAttribute("id");
        clip.append(copy);
        reveal.append(clip);
        return reveal;
      }));

      Object.assign(panel.style, {
        left: `${rect.left - layerRect.left}px`,
        top: `${rect.top - layerRect.top}px`,
        width: `${rect.width}px`,
        minHeight: `${rect.height}px`,
        paddingInlineStart: infoStyle.paddingInlineStart,
        paddingInlineEnd: infoStyle.paddingInlineEnd,
        paddingBlockStart: infoStyle.paddingBlockStart,
        paddingBlockEnd: `${bottomInset}px`,
      });

      panel.addEventListener("click", () => {
        if (previewedWorkCard === card) openProject(card);
      });

      const preview = { panel, removeTimer: 0 };
      workCardPreviews.set(card, preview);
      workPreviewLayer.append(panel);
      // Resolve the resting layout before starting a newly mounted transition.
      void panel.offsetHeight;
      return preview;
    }

    function showWorkCardPreview(card) {
      if (card === previewedWorkCard || !hoverQuery.matches || card.hidden
        || document.body.matches(".project-preparing, .project-open, .project-home-hidden")) return;
      const info = card.querySelector(".case-info");
      const intro = info?.querySelector(".case-intro");
      if (!intro) return;

      collapseWorkCardPreview();
      const preview = workCardPreviews.get(card) || mountWorkCardPreview(card, info, intro);
      clearTimeout(preview.removeTimer);
      previewedWorkCard = card;
      card.classList.add("is-work-previewing");
      preview.panel.classList.add("is-expanded");
    }

    function workCardAt(hit) {
      const current = previewedWorkCard;
      if (current && workCardPreviews.get(current).panel.contains(hit)) return current;
      return projectCardMap.contains(hit) ? hit.closest(".case-card[data-work-preview][data-project-ready]") : null;
    }

    function syncPreviewHit(hit) {
      const card = workCardAt(hit);
      if (card) {
        showWorkCardPreview(card);
      } else if (!previewedWorkCard?.matches(":focus-visible")) {
        collapseWorkCardPreview();
      }
    }

    function checkPreviewPointer() {
      scrollCheckFrame = 0;
      if (pointerX >= 0) syncPreviewHit(document.elementFromPoint(pointerX, pointerY));
    }

    function clearPreviewPointer() {
      pointerX = -1;
      pointerY = -1;
      syncPreviewHit(null);
    }

    function queuePreviewPointerCheck() {
      if (pointerX < 0 || scrollCheckFrame || !hoverQuery.matches) return;
      scrollCheckFrame = requestAnimationFrame(checkPreviewPointer);
    }

    window.addEventListener("pointermove", (event) => {
      if (!hoverQuery.matches || event.pointerType === "touch") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      const target = event.target;
      syncPreviewHit(target instanceof Element ? target : null);
    }, { passive: true });
    window.addEventListener("wheel", (event) => {
      if (!hoverQuery.matches) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      queuePreviewPointerCheck();
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", clearPreviewPointer);
    window.addEventListener("blur", clearPreviewPointer);
    window.addEventListener("scroll", queuePreviewPointerCheck, { passive: true });

    cards.forEach((card) => {
      card.addEventListener("focusin", () => {
        if (!card.matches(":focus-visible")) return;
        pointerX = -1;
        pointerY = -1;
        showWorkCardPreview(card);
      });
      card.addEventListener("focusout", () => {
        if (previewedWorkCard === card && workCardAt(document.elementFromPoint(pointerX, pointerY)) !== card) {
          collapseWorkCardPreview();
        }
      });
    });
    window.addEventListener("resize", closeWorkCardPreview, { passive: true });
    hoverQuery.addEventListener("change", closeWorkCardPreview);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") collapseWorkCardPreview();
    });

    return {
      close: closeWorkCardPreview,
      setLanguage(language) {
        const languageIndex = language === "zh" ? 1 : 0;
        for (const [intro, copy] of introElements) intro.textContent = copy[languageIndex];
      },
    };
  };
})();
