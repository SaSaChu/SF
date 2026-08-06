
/** banner設定 **/
$(function () {
  'use strict';

  var $window = $(window);
  var $document = $(document);
  var $html = $('html');
  var $body = $('body');

  var $header = $('[data-header]');
  var $hero = $('[data-hero]');
  var $menuButton = $('[data-menu-button]');
  var $menu = $('[data-menu]');

  var ticking = false;
  var isReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /**
   * 限制數值範圍
   *
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * 判斷選單是否開啟
   *
   * @returns {boolean}
   */
  function isMenuOpen() {
    return $menuButton.attr('aria-expanded') === 'true';
  }

  /**
   * 開啟選單
   */
  function openMenu() {
    $menuButton.attr({
      'aria-expanded': 'true',
      'aria-label': '關閉選單'
    });

    $menu
      .attr('aria-hidden', 'false')
      .addClass('is-open');

    $header.addClass('is-menu-open');
    $body.addClass('menu-open');
  }

  /**
   * 關閉選單
   */
  function closeMenu() {
    $menuButton.attr({
      'aria-expanded': 'false',
      'aria-label': '開啟選單'
    });

    $menu
      .attr('aria-hidden', 'true')
      .removeClass('is-open');

    $header.removeClass('is-menu-open');
    $body.removeClass('menu-open');
  }

  /**
   * 切換選單
   */
  function toggleMenu() {
    if (isMenuOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /**
   * 更新 Header 與 Banner 的捲動動態
   */
  function updateScrollEffects() {
    var scrollTop = $window.scrollTop();
    var heroHeight = $hero.outerHeight() || window.innerHeight || 1;

    /*
     * Header 捲動超過 30px 後切換樣式
     */
    $header.toggleClass('is-scrolled', scrollTop > 30);

    /*
     * 使用者偏好減少動態時，
     * 不套用 Banner 視差與淡出
     */
    if (isReducedMotion) {
      document.documentElement.style.setProperty(
        '--hero-image-shift',
        '0px'
      );

      document.documentElement.style.setProperty(
        '--hero-scroll-fade',
        '0'
      );

      ticking = false;
      return;
    }

    /*
     * 捲動進度：
     * 捲動到 Banner 高度的 75% 時接近 1
     */
    var progress = clamp(
      scrollTop / (heroHeight * 0.75),
      0,
      1
    );

    /*
     * 圖片以上方為定位基準，
     * 因此視差方向設定為向上移動。
     *
     * 最大向上移動 60px，
     * 避免人物位置偏移太多。
     */
    var imageShift = -Math.min(scrollTop * 0.1, 60);

    /*
     * 捲動後加入白色遮罩，
     * 最大透明度為 0.9。
     */
    var fadeOpacity = progress * 0.9;

    document.documentElement.style.setProperty(
      '--hero-image-shift',
      imageShift.toFixed(1) + 'px'
    );

    document.documentElement.style.setProperty(
      '--hero-scroll-fade',
      fadeOpacity.toFixed(3)
    );

    ticking = false;
  }

  /**
   * 使用 requestAnimationFrame 降低 scroll 負擔
   */
  function requestScrollUpdate() {
    if (ticking) {
      return;
    }

    ticking = true;

    window.requestAnimationFrame(updateScrollEffects);
  }

  /**
   * 漢堡按鈕
   */
  $menuButton.on('click', function () {
    toggleMenu();
  });

  /**
   * 錨點平滑捲動
   */
  $('a[href^="#"]').on('click', function (event) {
    var targetSelector = $(this).attr('href');

    /*
     * href="#" 不執行
     */
    if (
      !targetSelector ||
      targetSelector === '#' ||
      targetSelector.length < 2
    ) {
      return;
    }

    var $target = $(targetSelector);

    if (!$target.length) {
      return;
    }

    event.preventDefault();

    closeMenu();

    /*
     * Header 固定定位，
     * 因此扣除 Header 高度。
     *
     * Hero 本身回到 0，不扣 Header。
     */
    var headerHeight = $header.outerHeight() || 0;
    var targetTop = $target.offset().top;

    if (targetSelector !== '#top') {
      targetTop -= headerHeight;
    }

    if (isReducedMotion) {
      $html.add($body).scrollTop(targetTop);
      return;
    }

    $html
      .add($body)
      .stop(true)
      .animate(
        {
          scrollTop: targetTop
        },
        800,
        'swing'
      );
  });

  /**
   * ESC 關閉選單
   */
  $document.on('keydown', function (event) {
    if (event.key === 'Escape' && isMenuOpen()) {
      closeMenu();
      $menuButton.trigger('focus');
    }
  });

  /**
   * 點擊選單背景空白處時關閉
   */
  $menu.on('click', function (event) {
    if (event.target === this) {
      closeMenu();
    }
  });

  /**
   * 桌機尺寸變更時關閉選單
   */
  $window.on('resize orientationchange', function () {
    if (window.innerWidth >= 768 && isMenuOpen()) {
      closeMenu();
    }

    requestScrollUpdate();
  });

  /**
   * 捲動事件
   */
  $window.on('scroll', requestScrollUpdate);

  /**
   * 頁面載入完成後重新計算
   */
  $window.on('load', updateScrollEffects);

  /**
   * 初始化
   */
  updateScrollEffects();
});


// 影片效果
/* ==========================================================================
   Brand Background Video Playlist
   多支背景影片依序播放，最後一支播完回到第一支
============================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const videoHeroes = Array.from(
    document.querySelectorAll(
      "[data-sfb-video-hero]"
    )
  );

  if (!videoHeroes.length) {
    return;
  }

  const reducedMotionMedia = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  videoHeroes.forEach((section) => {
    const videos = Array.from(
      section.querySelectorAll(
        "[data-sfb-background-video]"
      )
    );

    const control = section.querySelector(
      "[data-sfb-video-control]"
    );

    if (!videos.length) {
      return;
    }

    let currentIndex = 0;
    let isPausedByUser = false;
    let isVisible = false;
    let switchTimer = null;


    /**
     * 停止全部影片，但不歸零。
     */
    const pauseAllVideos = () => {
      videos.forEach((video) => {
        video.pause();
      });
    };


    /**
     * 清除延遲切換計時器。
     */
    const clearSwitchTimer = () => {
      if (switchTimer === null) {
        return;
      }

      window.clearTimeout(switchTimer);
      switchTimer = null;
    };


    /**
     * 播放指定影片。
     *
     * @param {number} nextIndex
     */
    const showVideo = async (nextIndex) => {
      clearSwitchTimer();

      const normalizedIndex =
        (nextIndex + videos.length) % videos.length;

      const previousVideo = videos[currentIndex];
      const nextVideo = videos[normalizedIndex];

      currentIndex = normalizedIndex;

      videos.forEach((video, index) => {
        const isActive = index === normalizedIndex;

        video.classList.toggle(
          "is-active",
          isActive
        );

        video.setAttribute(
          "aria-hidden",
          isActive ? "false" : "true"
        );

        if (!isActive) {
          video.pause();
        }
      });

      /*
       * 每次切入時從頭播放。
       */
      try {
        nextVideo.currentTime = 0;
      } catch (error) {
        // 部分瀏覽器在 metadata 尚未載入時無法立即指定時間。
      }

      if (
        !isVisible ||
        isPausedByUser ||
        document.hidden ||
        reducedMotionMedia.matches
      ) {
        return;
      }

      try {
        await nextVideo.play();
      } catch (error) {
        /*
         * 若瀏覽器阻擋自動播放，
         * 保持第一幀並等待使用者操作。
         */
        isPausedByUser = true;
        updateControl();
      }

      /*
       * 前一支影片淡出完成後再歸零，
       * 避免切換瞬間出現空白。
       */
      if (previousVideo !== nextVideo) {
        switchTimer = window.setTimeout(
          () => {
            try {
              previousVideo.currentTime = 0;
            } catch (error) {
              // 忽略不支援情況。
            }
          },
          1100
        );
      }
    };


    /**
     * 播放下一支。
     */
    const showNextVideo = () => {
      showVideo(currentIndex + 1);
    };


    /**
     * 更新控制按鈕狀態。
     */
    const updateControl = () => {
      if (!control) {
        return;
      }

      control.classList.toggle(
        "is-paused",
        isPausedByUser
      );

      control.setAttribute(
        "aria-pressed",
        isPausedByUser ? "true" : "false"
      );

      control.setAttribute(
        "aria-label",
        isPausedByUser
          ? "播放背景影片"
          : "暫停背景影片"
      );
    };


    /**
     * 每一支影片播完後播放下一支。
     */
    videos.forEach((video) => {
      video.loop = false;
      video.muted = true;
      video.playsInline = true;

      video.addEventListener(
        "ended",
        showNextVideo
      );

      /*
       * 若影片載入失敗，直接跳下一支。
       */
      video.addEventListener(
        "error",
        () => {
          if (
            video.classList.contains(
              "is-active"
            )
          ) {
            showNextVideo();
          }
        }
      );
    });


    /**
     * 播放／暫停控制。
     */
    if (control) {
      control.addEventListener(
        "click",
        () => {
          isPausedByUser = !isPausedByUser;

          if (isPausedByUser) {
            pauseAllVideos();
          } else {
            showVideo(currentIndex);
          }

          updateControl();
        }
      );
    }


    /**
     * 區塊進入畫面後播放，
     * 離開畫面後暫停，節省效能。
     */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== section) {
            return;
          }

          isVisible = entry.isIntersecting;

          if (
            isVisible &&
            !isPausedByUser
          ) {
            showVideo(currentIndex);
          } else {
            pauseAllVideos();
          }
        });
      },
      {
        threshold: 0.15
      }
    );

    observer.observe(section);


    /**
     * 瀏覽器頁籤切換。
     */
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          pauseAllVideos();

          return;
        }

        if (
          isVisible &&
          !isPausedByUser
        ) {
          showVideo(currentIndex);
        }
      }
    );


    /**
     * 減少動態效果：
     * 停留在第一支影片的第一幀。
     */
    const handleMotionChange = () => {
      if (reducedMotionMedia.matches) {
        pauseAllVideos();
        showVideo(0);

        return;
      }

      if (
        isVisible &&
        !isPausedByUser
      ) {
        showVideo(currentIndex);
      }
    };

    if (
      typeof reducedMotionMedia
        .addEventListener ===
      "function"
    ) {
      reducedMotionMedia.addEventListener(
        "change",
        handleMotionChange
      );
    } else {
      reducedMotionMedia.addListener(
        handleMotionChange
      );
    }

    updateControl();
    showVideo(0);
  });
});


/** Store設定 **/
/* ==========================================================================
   Store Showcase Slider
   左側文字固定，右側圖片自動輪播
============================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const showcases = Array.from(
    document.querySelectorAll(
      "[data-sfb-store-showcase]"
    )
  );

  if (!showcases.length) {
    return;
  }

  const reducedMotionMedia = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  showcases.forEach((showcase) => {
    const slider = showcase.querySelector(
      "[data-sfb-store-slider]"
    );

    const slides = Array.from(
      showcase.querySelectorAll(
        "[data-sfb-store-slide]"
      )
    );

    const dots = Array.from(
      showcase.querySelectorAll(
        "[data-sfb-store-dot]"
      )
    );

    if (!slider || slides.length <= 1) {
      return;
    }

    const delayValue = Number.parseInt(
      showcase.dataset.autoplayDelay,
      10
    );

    const autoplayDelay = Number.isFinite(delayValue)
      ? delayValue
      : 4000;

    let currentIndex = 0;
    let autoplayTimer = null;
    let isVisible = false;

    let touchStartX = 0;
    let touchEndX = 0;

    const showSlide = (nextIndex) => {
      const normalizedIndex =
        (nextIndex + slides.length) % slides.length;

      currentIndex = normalizedIndex;

      slides.forEach((slide, index) => {
        const isActive = index === normalizedIndex;

        slide.classList.toggle(
          "is-active",
          isActive
        );

        slide.setAttribute(
          "aria-hidden",
          isActive ? "false" : "true"
        );
      });

      dots.forEach((dot, index) => {
        const isActive = index === normalizedIndex;

        dot.classList.toggle(
          "is-active",
          isActive
        );

        dot.setAttribute(
          "aria-current",
          isActive ? "true" : "false"
        );
      });
    };

    const stopAutoplay = () => {
      if (autoplayTimer === null) {
        return;
      }

      window.clearTimeout(autoplayTimer);

      autoplayTimer = null;
    };

    const scheduleNext = () => {
      stopAutoplay();

      if (
        !isVisible ||
        document.hidden ||
        reducedMotionMedia.matches
      ) {
        return;
      }

      autoplayTimer = window.setTimeout(
        () => {
          showSlide(currentIndex + 1);
          scheduleNext();
        },
        autoplayDelay
      );
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const targetIndex = Number.parseInt(
          dot.dataset.sfbStoreDot,
          10
        );

        if (!Number.isFinite(targetIndex)) {
          return;
        }

        showSlide(targetIndex);
        scheduleNext();
      });
    });

    slider.addEventListener(
      "touchstart",
      (event) => {
        touchStartX =
          event.changedTouches[0].clientX;

        touchEndX = touchStartX;
      },
      {
        passive: true
      }
    );

    slider.addEventListener(
      "touchmove",
      (event) => {
        touchEndX =
          event.changedTouches[0].clientX;
      },
      {
        passive: true
      }
    );

    slider.addEventListener(
      "touchend",
      () => {
        const swipeDistance =
          touchEndX - touchStartX;

        if (Math.abs(swipeDistance) < 45) {
          return;
        }

        if (swipeDistance < 0) {
          showSlide(currentIndex + 1);
        } else {
          showSlide(currentIndex - 1);
        }

        scheduleNext();
      }
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== showcase) {
            return;
          }

          isVisible = entry.isIntersecting;

          if (isVisible) {
            scheduleNext();
          } else {
            stopAutoplay();
          }
        });
      },
      {
        threshold: 0.15
      }
    );

    observer.observe(showcase);

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          stopAutoplay();
        } else if (isVisible) {
          scheduleNext();
        }
      }
    );

    showSlide(0);
  });
});



/** Story設定 **/
/**
 * SUNFLOWER BLUE LABEL
 * Story entrance animation
 *
 * 左側圖片先出現，
 * 右側文字延遲淡入。
 */

$(function () {
  'use strict';

  var $storySections = $('[data-sfb-story]');

  if (!$storySections.length) {
    return;
  }

  var reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /*
   * 使用者偏好減少動畫時直接顯示。
   */
  if (reduceMotion) {
    $storySections.addClass('is-visible');
    return;
  }

  /*
   * 支援 IntersectionObserver 的瀏覽器。
   */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries, currentObserver) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          $(entry.target).addClass('is-visible');

          /*
           * 動畫只執行一次。
           */
          currentObserver.unobserve(
            entry.target
          );
        });
      },
      {
        /*
         * 約有 25% 區塊進入畫面時觸發。
         */
        threshold: 0.25,

        /*
         * 提早一點觸發，
         * 避免畫面停頓後才開始。
         */
        rootMargin: '0px 0px -8% 0px'
      }
    );

    $storySections.each(function () {
      observer.observe(this);
    });

    return;
  }

  /*
   * 舊瀏覽器備用。
   */
  function checkStoryVisibility() {
    var viewportHeight =
      window.innerHeight || 1;

    $storySections.each(function () {
      var $section = $(this);

      if ($section.hasClass('is-visible')) {
        return;
      }

      var rect =
        this.getBoundingClientRect();

      if (
        rect.top <
        viewportHeight * 0.78
      ) {
        $section.addClass('is-visible');
      }
    });
  }

  $(window).on(
    'scroll resize orientationchange',
    checkStoryVisibility
  );

  $(window).on(
    'load',
    checkStoryVisibility
  );

  checkStoryVisibility();
});



/** 特色說明設定 **/
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initCottonSections();
    initReflexSections();
  });


  /* ==================================================
     01. Cotton entrance animation
  ================================================== */

  function initCottonSections() {
    const sections = document.querySelectorAll(
      "[data-sfb-cotton]"
    );

    if (!sections.length) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      sections.forEach(function (section) {
        section.classList.add("is-visible");
      });

      return;
    }

    if (!("IntersectionObserver" in window)) {
      sections.forEach(function (section) {
        section.classList.add("is-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      function (entries, currentObserver) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");

          /*
           * 只播放一次。
           */
          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }


  /* ==================================================
     02. Re-Flex scroll switching
  ================================================== */

  function initReflexSections() {
    const sections = document.querySelectorAll(
      "[data-sfb-reflex]"
    );

    if (!sections.length) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    sections.forEach(function (section) {
      createReflexController(section, reduceMotion);
    });
  }


  function createReflexController(section, reduceMotion) {
    const slides = Array.from(
      section.querySelectorAll("[data-sfb-reflex-slide]")
    );

    const items = Array.from(
      section.querySelectorAll("[data-sfb-reflex-item]")
    );

    const progressBar = section.querySelector(
      ".sfb-reflex-progress__bar"
    );

    const stepCount = Math.min(
      slides.length,
      items.length
    );

    if (!stepCount) {
      return;
    }

    let activeIndex = 0;
    let previousIndex = 0;
    let ticking = false;


    /* ------------------------------------------
       Set active state
    ------------------------------------------ */

    function setActiveIndex(nextIndex) {
      const safeIndex = Math.max(
        0,
        Math.min(nextIndex, stepCount - 1)
      );

      if (
        safeIndex === activeIndex &&
        slides[safeIndex].classList.contains("is-active")
      ) {
        return;
      }

      previousIndex = activeIndex;
      activeIndex = safeIndex;

      slides.forEach(function (slide, index) {
        const isActive = index === activeIndex;
        const isLeaving = index === previousIndex && !isActive;

        slide.classList.toggle(
          "is-active",
          isActive
        );

        slide.classList.toggle(
          "is-leaving",
          isLeaving
        );

        slide.setAttribute(
          "aria-hidden",
          isActive ? "false" : "true"
        );
      });

      items.forEach(function (item, index) {
        const isActive = index === activeIndex;
        const button = item.querySelector("button");

        item.classList.toggle(
          "is-active",
          isActive
        );

        if (!button) {
          return;
        }

        if (isActive) {
          button.setAttribute(
            "aria-current",
            "step"
          );
        } else {
          button.removeAttribute(
            "aria-current"
          );
        }
      });
    }


    /* ------------------------------------------
       Read scroll position
    ------------------------------------------ */

    function updateFromScroll() {
      const sectionRect = section.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight ||
        document.documentElement.clientHeight;

      /*
       * Sticky 可以移動的實際距離：
       * section 高度減掉一個 viewport。
       */
      const scrollDistance =
        section.offsetHeight - viewportHeight;

      if (scrollDistance <= 0) {
        ticking = false;
        return;
      }

      /*
       * section top 為負值時，
       * 表示已經捲入 sticky 區段。
       */
      const travelled = Math.min(
        Math.max(-sectionRect.top, 0),
        scrollDistance
      );

      const progress = travelled / scrollDistance;

      /*
       * 0～0.25：第一張
       * 0.25～0.75：第二張
       * 0.75～1：第三張
       */
      const nextIndex = Math.min(
        stepCount - 1,
        Math.floor(progress * stepCount)
      );

      setActiveIndex(nextIndex);

      if (progressBar) {
        progressBar.style.transform =
          "scaleX(" + progress.toFixed(4) + ")";
      }

      ticking = false;
    }


    function requestUpdate() {
      if (ticking) {
        return;
      }

      ticking = true;

      window.requestAnimationFrame(
        updateFromScroll
      );
    }


    /* ------------------------------------------
       Click item and scroll to its step
    ------------------------------------------ */

    items.forEach(function (item, index) {
      const button = item.querySelector("button");

      if (!button) {
        return;
      }

      button.addEventListener("click", function () {
        const sectionTop =
          window.scrollY +
          section.getBoundingClientRect().top;

        const viewportHeight =
          window.innerHeight ||
          document.documentElement.clientHeight;

        const scrollDistance =
          section.offsetHeight - viewportHeight;

        const targetProgress =
          stepCount > 1
            ? index / (stepCount - 1)
            : 0;

        const targetY =
          sectionTop +
          scrollDistance * targetProgress;

        window.scrollTo({
          top: targetY,
          behavior: reduceMotion
            ? "auto"
            : "smooth"
        });
      });
    });


    /* ------------------------------------------
       Events
    ------------------------------------------ */

    window.addEventListener(
      "scroll",
      requestUpdate,
      {
        passive: true
      }
    );

    window.addEventListener(
      "resize",
      requestUpdate
    );

    window.addEventListener(
      "load",
      requestUpdate
    );

    /*
     * 初始狀態。
     */
    setActiveIndex(0);
    updateFromScroll();
  }
})();



/** 系列說明設定 **/ 
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initProductSeries();
  });

  function initProductSeries() {
    const sections = document.querySelectorAll(
      "[data-sfb-product-series]"
    );

    if (!sections.length) {
      return;
    }

    sections.forEach(function (section) {
      const viewport = section.querySelector(
        "[data-sfb-product-viewport]"
      );

      const mainCard = section.querySelector(
        ".sfb-product-card--main"
      );

      if (!viewport) {
        return;
      }

      let isDragging = false;
      let dragMoved = false;
      let startX = 0;
      let startScrollLeft = 0;


      /* ------------------------------------------
         手機版預設讓主圖靠近中央
      ------------------------------------------ */

      function centerMainCard() {
        if (
          window.matchMedia("(min-width: 768px)").matches ||
          !mainCard
        ) {
          return;
        }

        const viewportWidth = viewport.clientWidth;
        const cardLeft = mainCard.offsetLeft;
        const cardWidth = mainCard.offsetWidth;

        const targetScrollLeft =
          cardLeft -
          (viewportWidth - cardWidth) / 2;

        viewport.scrollTo({
          left: Math.max(targetScrollLeft, 0),
          behavior: "auto"
        });
      }


      /* ------------------------------------------
         Mouse drag
      ------------------------------------------ */

      viewport.addEventListener("pointerdown", function (event) {
        if (event.pointerType === "touch") {
          return;
        }

        isDragging = true;
        dragMoved = false;

        startX = event.clientX;
        startScrollLeft = viewport.scrollLeft;

        viewport.classList.add("is-dragging");
        viewport.setPointerCapture(event.pointerId);
      });

      viewport.addEventListener("pointermove", function (event) {
        if (!isDragging) {
          return;
        }

        const distance = event.clientX - startX;

        if (Math.abs(distance) > 5) {
          dragMoved = true;
        }

        viewport.scrollLeft =
          startScrollLeft - distance;
      });

      function stopDragging(event) {
        if (!isDragging) {
          return;
        }

        isDragging = false;

        viewport.classList.remove("is-dragging");

        if (
          event &&
          viewport.hasPointerCapture(event.pointerId)
        ) {
          viewport.releasePointerCapture(event.pointerId);
        }
      }

      viewport.addEventListener(
        "pointerup",
        stopDragging
      );

      viewport.addEventListener(
        "pointercancel",
        stopDragging
      );

      viewport.addEventListener(
        "pointerleave",
        function (event) {
          if (isDragging) {
            stopDragging(event);
          }
        }
      );


      /* ------------------------------------------
         防止拖曳後誤開連結
      ------------------------------------------ */

      viewport.addEventListener(
        "click",
        function (event) {
          if (!dragMoved) {
            return;
          }

          const productLink = event.target.closest(
            ".sfb-product-card"
          );

          if (productLink) {
            event.preventDefault();
          }

          dragMoved = false;
        },
        true
      );


      /* ------------------------------------------
         Initial position
      ------------------------------------------ */

      window.addEventListener(
        "load",
        centerMainCard
      );

      window.addEventListener(
        "resize",
        centerMainCard
      );

      /*
       * 等圖片與排版建立後再定位。
       */
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(
          centerMainCard
        );
      });
    });
  }
})();



/** 升級說明設定 **/
/* ==========================================================================
   Comfort Upgrade Auto Slider
   Step.1 與 Step.2 各自獨立自動輪播
   圖片、文字、進度線同步切換
============================================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const comfortSliders = Array.from(
    document.querySelectorAll(
      "[data-sfb-comfort-slider]"
    )
  );

  if (!comfortSliders.length) {
    return;
  }

  const reducedMotionMedia = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  comfortSliders.forEach((slider, sliderIndex) => {
    const copies = Array.from(
      slider.querySelectorAll(
        "[data-sfb-comfort-copy]"
      )
    );

    const images = Array.from(
      slider.querySelectorAll(
        "[data-sfb-comfort-image]"
      )
    );

    const progressItems = Array.from(
      slider.querySelectorAll(
        "[data-sfb-comfort-progress]"
      )
    );

    /*
     * 每個區塊的圖片數量與文字數量必須一致。
     * 取最少的數量，避免其中一組缺少內容時發生錯誤。
     */
    const slideCount = Math.min(
      copies.length,
      images.length
    );

    if (slideCount === 0) {
      return;
    }

    const delayFromHtml = Number.parseInt(
      slider.dataset.autoplayDelay,
      10
    );

    const autoplayDelay = Number.isFinite(
      delayFromHtml
    )
      ? delayFromHtml
      : 4500;

    let currentIndex = 0;
    let autoplayTimer = null;
    let isVisible = false;

    /**
     * 顯示指定索引的內容。
     *
     * @param {number} nextIndex
     */
    const showSlide = (nextIndex) => {
      const normalizedIndex =
        (
          nextIndex +
          slideCount
        ) %
        slideCount;

      currentIndex = normalizedIndex;

      copies.forEach((copy, copyIndex) => {
        const isActive =
          copyIndex === normalizedIndex;

        copy.classList.toggle(
          "is-active",
          isActive
        );

        copy.setAttribute(
          "aria-hidden",
          isActive
            ? "false"
            : "true"
        );
      });

      images.forEach((image, imageIndex) => {
        const isActive =
          imageIndex === normalizedIndex;

        image.classList.toggle(
          "is-active",
          isActive
        );

        image.setAttribute(
          "aria-hidden",
          isActive
            ? "false"
            : "true"
        );
      });

      progressItems.forEach(
        (
          progressItem,
          progressIndex
        ) => {
          progressItem.classList.toggle(
            "is-active",
            progressIndex ===
              normalizedIndex
          );
        }
      );
    };

    /**
     * 停止此區塊的自動播放。
     */
    const stopAutoplay = () => {
      if (autoplayTimer === null) {
        return;
      }

      window.clearTimeout(
        autoplayTimer
      );

      autoplayTimer = null;
    };

    /**
     * 排定下一張。
     * 使用 setTimeout 而不是 setInterval，
     * 可以避免重複建立多個計時器。
     */
    const scheduleNextSlide = () => {
      stopAutoplay();

      if (
        !isVisible ||
        document.hidden ||
        reducedMotionMedia.matches ||
        slideCount <= 1
      ) {
        return;
      }

      autoplayTimer = window.setTimeout(
        () => {
          showSlide(
            currentIndex + 1
          );

          scheduleNextSlide();
        },
        autoplayDelay
      );
    };

    /**
     * 初始化第一組內容。
     */
    showSlide(0);

    /**
     * 判斷區塊是否進入視窗。
     *
     * Step.1 和 Step.2 各自擁有一個 observer，
     * 因此兩區的輪播不會互相影響。
     */
    const sliderObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (
              entry.target !== slider
            ) {
              return;
            }

            isVisible =
              entry.isIntersecting &&
              entry.intersectionRatio > 0;

            if (isVisible) {
              /*
               * 第二區塊略微錯開播放時間，
               * 避免兩個區塊永遠同步切換。
               */
              const initialDelay =
                sliderIndex === 0
                  ? 0
                  : 350;

              window.setTimeout(
                () => {
                  if (isVisible) {
                    scheduleNextSlide();
                  }
                },
                initialDelay
              );
            } else {
              stopAutoplay();
            }
          });
        },
        {
          threshold: [
            0,
            0.05,
            0.15,
            0.3
          ],

          rootMargin:
            "80px 0px 80px 0px"
        }
      );

    sliderObserver.observe(slider);

    /**
     * 切換到其他瀏覽器頁籤時停止，
     * 回到目前頁面後重新播放。
     */
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          stopAutoplay();

          return;
        }

        if (isVisible) {
          scheduleNextSlide();
        }
      }
    );

    /**
     * 使用者修改系統的動態效果設定。
     */
    const handleMotionChange = () => {
      if (
        reducedMotionMedia.matches
      ) {
        stopAutoplay();
        showSlide(0);

        return;
      }

      if (isVisible) {
        scheduleNextSlide();
      }
    };

    if (
      typeof reducedMotionMedia
        .addEventListener ===
      "function"
    ) {
      reducedMotionMedia.addEventListener(
        "change",
        handleMotionChange
      );
    } else if (
      typeof reducedMotionMedia
        .addListener ===
      "function"
    ) {
      /*
       * 相容較舊版本 Safari。
       */
      reducedMotionMedia.addListener(
        handleMotionChange
      );
    }
  });
});



/** 產品設定 **/
/* ==========================================================================
   Blue Label Featured Products
   Desktop:
   - 第一次滑鼠進入商品區時，商品依序出現。
   - 動畫完成後永久保持顯示，不再重播。

   Mobile / Touch:
   - 區塊第一次進入畫面時，商品依序出現。
   - 動畫完成後永久保持顯示，不再重播。
============================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const sections = Array.from(
    document.querySelectorAll(
      "[data-sfb-featured-products]"
    )
  );

  if (!sections.length) {
    return;
  }

  const hoverMedia = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const reducedMotionMedia = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  sections.forEach((section) => {
    const products = Array.from(
      section.querySelectorAll(
        "[data-sfb-featured-product]"
      )
    );

    if (!products.length) {
      return;
    }

    let hasPlayed = false;

    /**
     * 將商品索引寫入 CSS 變數，
     * 讓每張商品依序延遲出現。
     */
    products.forEach((product, index) => {
      product.style.setProperty(
        "--sfb-featured-index",
        index.toString()
      );
    });

    /**
     * 播放一次商品出現動畫。
     * 播放過後不再執行。
     */
    const revealProductsOnce = () => {
      if (hasPlayed) {
        return;
      }

      hasPlayed = true;

      products.forEach((product) => {
        product.classList.add(
          "is-visible"
        );
      });
    };

    /**
     * Reduced Motion：
     * 不執行動畫，直接顯示全部商品。
     */
    if (reducedMotionMedia.matches) {
      revealProductsOnce();

      return;
    }

    /**
     * 桌機版：
     * 第一次滑鼠進入區塊時播放。
     */
    section.addEventListener(
      "mouseenter",
      revealProductsOnce,
      {
        once: true
      }
    );

    /**
     * 鍵盤使用者：
     * 第一次將焦點移入商品區時播放。
     */
    section.addEventListener(
      "focusin",
      revealProductsOnce,
      {
        once: true
      }
    );

    /**
     * 手機與觸控裝置：
     * 區塊第一次進入視窗時播放。
     *
     * 桌機版不會因捲動進入視窗而播放，
     * 仍等待滑鼠第一次移入。
     */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.target !== section ||
            !entry.isIntersecting ||
            hasPlayed
          ) {
            return;
          }

          if (!hoverMedia.matches) {
            revealProductsOnce();
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    observer.observe(section);

    /**
     * 裝置模式改變時處理。
     * 例如平板旋轉、接上或移除滑鼠。
     */
    const handleInputChange = () => {
      if (hasPlayed) {
        observer.disconnect();

        return;
      }

      if (reducedMotionMedia.matches) {
        revealProductsOnce();
        observer.disconnect();
      }
    };

    if (
      typeof hoverMedia.addEventListener ===
      "function"
    ) {
      hoverMedia.addEventListener(
        "change",
        handleInputChange
      );

      reducedMotionMedia.addEventListener(
        "change",
        handleInputChange
      );
    } else {
      hoverMedia.addListener(
        handleInputChange
      );

      reducedMotionMedia.addListener(
        handleInputChange
      );
    }
  });
});




/** 回航計劃設定 **/
/* ==========================================================================
   Blue Label Circular Project
   Desktop:
   - 第一次滑鼠進入區塊時，三張卡片依序出現。
   - 播放完成後永久顯示，不再重播。

   Mobile / Touch:
   - 第一次進入畫面時依序出現。
   - 播放完成後永久顯示，不再重播。
============================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const sections = Array.from(
    document.querySelectorAll(
      "[data-sfb-circular]"
    )
  );

  if (!sections.length) {
    return;
  }

  const hoverMedia = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const reducedMotionMedia = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  sections.forEach((section) => {
    const cards = Array.from(
      section.querySelectorAll(
        "[data-sfb-circular-card]"
      )
    );

    if (!cards.length) {
      return;
    }

    let hasPlayed = false;

    /**
     * 將每張卡片索引寫入 CSS 變數，
     * 用於控制依序出現的延遲時間。
     */
    cards.forEach((card, index) => {
      card.style.setProperty(
        "--sfb-circular-index",
        index.toString()
      );
    });

    /**
     * 播放一次卡片顯示動畫。
     */
    const revealCardsOnce = () => {
      if (hasPlayed) {
        return;
      }

      hasPlayed = true;

      cards.forEach((card) => {
        card.classList.add(
          "is-visible"
        );
      });

      observer.disconnect();
    };

    /**
     * Reduced Motion：
     * 不播放動畫，直接顯示。
     */
    if (reducedMotionMedia.matches) {
      cards.forEach((card) => {
        card.classList.add(
          "is-visible"
        );
      });

      hasPlayed = true;

      return;
    }

    /**
     * 桌機第一次滑鼠移入時播放。
     */
    section.addEventListener(
      "mouseenter",
      revealCardsOnce,
      {
        once: true
      }
    );

    /**
     * 鍵盤焦點第一次進入時也播放。
     */
    section.addEventListener(
      "focusin",
      revealCardsOnce,
      {
        once: true
      }
    );

    /**
     * 手機與觸控裝置沒有 Hover，
     * 第一次進入視窗後自動播放。
     */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.target !== section ||
            !entry.isIntersecting ||
            hasPlayed
          ) {
            return;
          }

          if (!hoverMedia.matches) {
            revealCardsOnce();
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    observer.observe(section);
  });
});