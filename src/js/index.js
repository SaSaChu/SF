
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