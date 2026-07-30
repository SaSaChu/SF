
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



/** Store設定 **/
/**
 * SUNFLOWER BLUE LABEL
 * Store Slider
 *
 * Desktop:
 * 滑鼠位於 Store 區塊時，以滾輪切換門市。
 * 第一張往上、最後一張往下時，恢復頁面正常捲動。
 *
 * Mobile:
 * 自動輪播、左右滑動、圓點切換。
 */

$(function () {
  'use strict';

  var $window = $(window);
  var $document = $(document);

  var $storeSection = $('[data-sfb-store]');
  var $storeSlides = $('[data-sfb-store-slide]');
  var $storePagination = $('[data-sfb-store-pagination]');

  /*
   * 頁面沒有 Store 時停止執行。
   */
  if (
    !$storeSection.length ||
    !$storeSlides.length
  ) {
    return;
  }

  var storeElement = $storeSection.get(0);
  var slideCount = $storeSlides.length;
  var currentIndex = 0;

  /*
   * 版型斷點。
   */
  var mobileBreakpoint = 768;

  /*
   * 桌機滾輪設定。
   */
  var wheelThreshold = 35;
  var wheelCooldown = 850;

  var wheelAccumulator = 0;
  var wheelLocked = false;
  var wheelUnlockTimer = null;

  /*
   * 手機自動輪播。
   */
  var autoplayDelay = 4500;
  var autoplayTimer = null;

  /*
   * 手機觸控資料。
   */
  var touchStartX = 0;
  var touchStartY = 0;

  var touchCurrentX = 0;
  var touchCurrentY = 0;

  var isTouching = false;

  /*
   * 使用者是否偏好減少動畫。
   */
  var reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /**
   * 判斷目前是否為手機版。
   *
   * @returns {boolean}
   */
  function isMobile() {
    return window.innerWidth < mobileBreakpoint;
  }

  /**
   * 限制數值範圍。
   *
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function clamp(value, min, max) {
    return Math.min(
      Math.max(value, min),
      max
    );
  }

  /**
   * 取得 Header 高度。
   *
   * @returns {number}
   */
  function getHeaderHeight() {
    var cssValue = getComputedStyle(
      document.documentElement
    ).getPropertyValue('--header-height');

    var headerHeight = parseFloat(cssValue);

    if (!Number.isNaN(headerHeight)) {
      return headerHeight;
    }

    var $header = $('[data-header]');

    if ($header.length) {
      return $header.outerHeight() || 0;
    }

    return 0;
  }

  /**
   * 建立手機版輪播圓點。
   */
  function createPagination() {
    if (!$storePagination.length) {
      return;
    }

    $storePagination.empty();

    $storeSlides.each(function (index) {
      var $button = $('<button>', {
        type: 'button',
        class: 'sfb-store-pagination__button',
        'aria-label':
          '切換至第 ' +
          (index + 1) +
          ' 間門市',
        'data-sfb-store-page': index
      });

      $storePagination.append($button);
    });
  }

  /**
   * 更新門市 Slide 狀態。
   *
   * @param {number} nextIndex
   */
  function updateSlides(nextIndex) {
    var safeIndex = clamp(
      nextIndex,
      0,
      slideCount - 1
    );

    currentIndex = safeIndex;

    $storeSlides.each(function (index) {
      var $slide = $(this);

      $slide
        .removeClass(
          'is-active is-before is-after'
        )
        .attr('aria-hidden', 'true');

      if (index < currentIndex) {
        $slide.addClass('is-before');
        return;
      }

      if (index > currentIndex) {
        $slide.addClass('is-after');
        return;
      }

      $slide
        .addClass('is-active')
        .attr('aria-hidden', 'false');
    });

    if ($storePagination.length) {
      $storePagination
        .find('[data-sfb-store-page]')
        .removeClass('is-active')
        .removeAttr('aria-current')
        .eq(currentIndex)
        .addClass('is-active')
        .attr('aria-current', 'true');
    }
  }

  /**
   * 切換下一間門市。
   *
   * @param {boolean} loop
   * @returns {boolean}
   */
  function goToNextSlide(loop) {
    if (currentIndex < slideCount - 1) {
      updateSlides(currentIndex + 1);
      return true;
    }

    if (loop) {
      updateSlides(0);
      return true;
    }

    return false;
  }

  /**
   * 切換上一間門市。
   *
   * @param {boolean} loop
   * @returns {boolean}
   */
  function goToPreviousSlide(loop) {
    if (currentIndex > 0) {
      updateSlides(currentIndex - 1);
      return true;
    }

    if (loop) {
      updateSlides(slideCount - 1);
      return true;
    }

    return false;
  }

  /**
   * 判斷 Store 是否已進入主要操作範圍。
   *
   * Store 不需要完全填滿畫面。
   * 只要區塊大部分可見，即可接管滾輪。
   *
   * @returns {boolean}
   */
  function isStoreReadyForWheel() {
    var rect =
      storeElement.getBoundingClientRect();

    var headerHeight =
      getHeaderHeight();

    var viewportHeight =
      window.innerHeight;

    var visibleTop = Math.max(
      rect.top,
      headerHeight
    );

    var visibleBottom = Math.min(
      rect.bottom,
      viewportHeight
    );

    var visibleHeight = Math.max(
      visibleBottom - visibleTop,
      0
    );

    var requiredVisibleHeight =
      rect.height * 0.72;

    return (
      visibleHeight >= requiredVisibleHeight
    );
  }

  /**
   * 暫時鎖定桌機滾輪。
   *
   * 避免觸控板一次觸發多張切換。
   */
  function lockWheel() {
    wheelLocked = true;
    wheelAccumulator = 0;

    window.clearTimeout(wheelUnlockTimer);

    wheelUnlockTimer = window.setTimeout(
      function () {
        wheelLocked = false;
      },
      reduceMotion ? 100 : wheelCooldown
    );
  }

  /**
   * 桌機版滾輪事件。
   *
   * @param {WheelEvent} event
   */
  function handleDesktopWheel(event) {
    if (
      isMobile() ||
      slideCount <= 1
    ) {
      return;
    }

    if (!isStoreReadyForWheel()) {
      wheelAccumulator = 0;
      return;
    }

    var deltaY = event.deltaY;

    if (!deltaY) {
      return;
    }

    /*
     * 第一張繼續往上時，
     * 讓頁面正常回到上一個區塊。
     */
    if (
      deltaY < 0 &&
      currentIndex === 0
    ) {
      wheelAccumulator = 0;
      return;
    }

    /*
     * 最後一張繼續往下時，
     * 讓頁面正常進入 Footer。
     */
    if (
      deltaY > 0 &&
      currentIndex === slideCount - 1
    ) {
      wheelAccumulator = 0;
      return;
    }

    /*
     * 還有門市可以切換時，
     * 阻止頁面垂直滾動。
     */
    event.preventDefault();

    if (wheelLocked) {
      return;
    }

    wheelAccumulator += deltaY;

    if (
      Math.abs(wheelAccumulator) <
      wheelThreshold
    ) {
      return;
    }

    if (wheelAccumulator > 0) {
      goToNextSlide(false);
    } else {
      goToPreviousSlide(false);
    }

    lockWheel();
  }

  /*
   * 使用原生 addEventListener，
   * passive 必須設為 false，
   * 才能使用 preventDefault。
   */
  storeElement.addEventListener(
    'wheel',
    handleDesktopWheel,
    {
      passive: false
    }
  );

  /**
   * 停止手機自動輪播。
   */
  function stopAutoplay() {
    if (!autoplayTimer) {
      return;
    }

    window.clearInterval(autoplayTimer);

    autoplayTimer = null;
  }

  /**
   * 啟動手機自動輪播。
   */
  function startAutoplay() {
    stopAutoplay();

    if (
      !isMobile() ||
      reduceMotion ||
      slideCount <= 1 ||
      document.hidden
    ) {
      return;
    }

    autoplayTimer = window.setInterval(
      function () {
        goToNextSlide(true);
      },
      autoplayDelay
    );
  }

  /**
   * 重新啟動手機自動輪播。
   */
  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  /**
   * 手機觸控開始。
   */
  $storeSection.on(
    'touchstart',
    function (event) {
      if (!isMobile()) {
        return;
      }

      var originalEvent =
        event.originalEvent;

      if (
        !originalEvent.touches ||
        !originalEvent.touches.length
      ) {
        return;
      }

      var touch =
        originalEvent.touches[0];

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;

      touchCurrentX = touchStartX;
      touchCurrentY = touchStartY;

      isTouching = true;

      stopAutoplay();
    }
  );

  /**
   * 手機觸控移動。
   */
  $storeSection.on(
    'touchmove',
    function (event) {
      if (
        !isMobile() ||
        !isTouching
      ) {
        return;
      }

      var originalEvent =
        event.originalEvent;

      if (
        !originalEvent.touches ||
        !originalEvent.touches.length
      ) {
        return;
      }

      var touch =
        originalEvent.touches[0];

      touchCurrentX = touch.clientX;
      touchCurrentY = touch.clientY;

      var moveX =
        touchCurrentX - touchStartX;

      var moveY =
        touchCurrentY - touchStartY;

      /*
       * 確定是水平滑動時，
       * 才阻止頁面上下捲動。
       */
      if (
        Math.abs(moveX) >
        Math.abs(moveY)
      ) {
        event.preventDefault();
      }
    }
  );

  /**
   * 手機觸控結束。
   */
  $storeSection.on(
    'touchend touchcancel',
    function () {
      if (
        !isMobile() ||
        !isTouching
      ) {
        return;
      }

      var distanceX =
        touchCurrentX - touchStartX;

      var distanceY =
        touchCurrentY - touchStartY;

      var swipeThreshold = 45;

      if (
        Math.abs(distanceX) >
        Math.abs(distanceY)
      ) {
        if (
          distanceX <= -swipeThreshold
        ) {
          goToNextSlide(true);
        } else if (
          distanceX >= swipeThreshold
        ) {
          goToPreviousSlide(true);
        }
      }

      isTouching = false;

      restartAutoplay();
    }
  );

  /**
   * 手機版輪播圓點。
   */
  $storePagination.on(
    'click',
    '[data-sfb-store-page]',
    function () {
      var index = Number(
        $(this).attr(
          'data-sfb-store-page'
        )
      );

      if (Number.isNaN(index)) {
        return;
      }

      updateSlides(index);
      restartAutoplay();
    }
  );

  /**
   * 頁面切換到背景時停止輪播。
   */
  $document.on(
    'visibilitychange',
    function () {
      if (document.hidden) {
        stopAutoplay();
        return;
      }

      if (isMobile()) {
        startAutoplay();
      }
    }
  );

  /**
   * 視窗尺寸切換。
   */
  $window.on(
    'resize orientationchange',
    function () {
      wheelAccumulator = 0;
      wheelLocked = false;

      window.clearTimeout(
        wheelUnlockTimer
      );

      if (isMobile()) {
        startAutoplay();
      } else {
        stopAutoplay();
      }
    }
  );

  /**
   * 初始化。
   */
  createPagination();
  updateSlides(0);

  if (isMobile()) {
    startAutoplay();
  }
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