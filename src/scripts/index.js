import $ from 'jquery'
import 'air-datepicker/dist/css/datepicker.css'
import 'air-datepicker/dist/js/datepicker'

const app = window.app = {}

window.$ = $

;(() => {
  class Calculate {
    constructor (_selectTrader, _inputUsd, _changeDate) {
      this.traders = _selectTrader
      this.usd = _inputUsd
      this.data = _changeDate
      this.traderJson = null
      this.cstSel = null
      this.results = null
      this.tableView = 0
      this.ratingTraders = null
      this.selectedTrader = null

      $.get('https://beta.membrana.dev/api/v2/challenge/result?round=0', (data) => {
        this.traderJson = data.results
      })

      $.get('https://beta.membrana.dev/api/v2/rating', (data) => {
        this.ratingTraders = data.rating
        this.selectedTrader = data.rating[0]
        // this.createTable()
        // this.initSelect()
        // this.helper()
        this.init()
        // this.initCalculate()
      })
    }

    init = function () {
      this.createTable()
      this.initSelect()
      this.helper()
      this.initDatapicer()
    }

    helper = () => {
      let traders = this.ratingTraders
      let selectTrader = this.selectedTrader

      document.body.addEventListener('click', toggleHelperList)

      function toggleHelperList (e) {
        if ($(e.target).hasClass('history-container__input') || $(e.target).hasClass('autocomplete__item')) {
          return
        }
        if ($('.autocomplete-list').hasClass('autocomplete-list_visible')) {
          $('.autocomplete-list').html('')
          $('.autocomplete-list').removeClass('autocomplete-list_visible')
        }
      }

      $('.autocomplete__input').on('input', function () {
        let inputValue = $(this).val()
        if (inputValue[0] === '@') {
          inputValue = inputValue.slice(1, inputValue.length)
        }
        $('.autocomplete-list').html('')

        let fragmentHelper = document.createDocumentFragment()

        traders.forEach((v, k) => {
          if (v.name.substr(0, inputValue.length) === inputValue) {
            let newDiv = document.createElement('div')
            newDiv.className = 'autocomplete__item'
            newDiv.innerHTML = `@${v.name}`
            newDiv.setAttribute('data-trader', v.name)
            fragmentHelper.appendChild(newDiv)
          }
        })

        document.querySelector('.autocomplete-list').appendChild(fragmentHelper)
        $('.autocomplete-list').addClass('autocomplete-list_visible')
      })

      $('.autocomplete__input').on('click', function () {
        if ($('.autocomplete-list')[0].childElementCount) {
          return
        }
        $('.autocomplete-list').html('')
        let fragmentHelper = document.createDocumentFragment()
        traders.forEach((v, k) => {
          if (v.name === selectTrader.name) {
            return
          }
          let newDiv = document.createElement('div')
          newDiv.className = 'autocomplete__item'
          newDiv.innerHTML = `@${v.name}`
          newDiv.setAttribute('data-trader', v.name)
          fragmentHelper.appendChild(newDiv)
        })

        document.querySelector('.autocomplete-list').appendChild(fragmentHelper)
        $('.autocomplete-list').addClass('autocomplete-list_visible')
      })

      $('.autocomplete-items').on('click', (e) => {
        let selectNewTrader = $(e.target).data('trader')
        $('.autocomplete-list').html('')
        $('.autocomplete-list').removeClass('autocomplete-list_visible')
        this.selectedTrader = {
          name: selectNewTrader
        }
        this.loaderOpen()

        document.querySelector('.trader-r__name').innerHTML = selectNewTrader
        $('.autocomplete .history-container__input').val(`@${selectNewTrader}`)
        this.calculate()
      })
    }

    loaderOpen = () => {
      $('.profit__flex').addClass('blur')
      $('.profit__loader').addClass('profit__loader_active')
    }

    loaderClose = () => {
      $('.profit__flex').removeClass('blur')
      $('.profit__loader').removeClass('profit__loader_active')
    }

    calculate = () => {
      let valueDataInput = $('.datepicker').val()
      let startDay = valueDataInput.substr(0, 2) + ''
      startDay = (startDay[0] === '0') ? startDay[1] : startDay
      let startMonth = valueDataInput.substr(3, 2) + ''
      startMonth = (startMonth[0] === '0') ? startMonth[1] : startMonth
      let startYear = valueDataInput.substr(6, 4) + ''
      let strForDate = `${startYear}/${startMonth}/${startDay}`
      let startDate = new Date(strForDate).getTime()
      let investment = 1
      let dayStart = startDate
      let dayEnd = new Date()
      let totalDays = (dayEnd - dayStart) / (1000 * 60 * 60 * 24)
      let traderName = this.selectedTrader.name
      $('.trader-r__day-ago').html(`(${totalDays.toFixed(0)} days ago)`)
      $('.trader-r__full-date').html(`${startDay}/${startMonth}/${startYear}`)
      $('.profit__btn .profit__btn-name').html(`@${traderName} `)

      this.requestCalculate(traderName, startDate, investment)
    }

    requestCalculate = (trader, date, investment) => {
      $.get(`https://beta.membrana.dev/api/v2/calculator?trader=${trader}&start=${date}&investment=${investment}`, (data) => {
        this.results = data
        let result = data.result
        document.querySelector('.income__usd').innerHTML = (result * $('.history-container__usd').val()).toFixed(1)

        if (result >= 1) {
          document.querySelector('.income__procent').innerHTML = `+${((result - 1) * 100).toFixed(1)}%`
        } else {
          document.querySelector('.income__procent').innerHTML = `-${((1 - result) * 100).toFixed(1)}%`
        }

        this.loaderClose()
      })
    }

    tableRows = (len) => {
      let fragmentTable = document.createDocumentFragment()
      for (let i = this.tableView; i < this.ratingTraders.length; i++) {
        if (!this.ratingTraders[i].verified) {
          continue
        }
        if (this.tableView >= len) {
          break
        }

        let item = this.ratingTraders[i]

        let tableTr = document.createElement('div')
        tableTr.className = 'table-rating__row table-rating__tr'
        tableTr.setAttribute('data-trader', `${item.name}`)

        let tdName = document.createElement('div')
        tdName.className = 'table-rating__td table-rating__name'
        tdName.innerHTML = `<span class="nicname">@${item.name}</span>`

        let tdimg1 = document.createElement('div')
        tdimg1.className = 'table-rating__td table-rating__pic table-rating__hide'
        tdimg1.innerHTML = `<img src="https://beta.membrana.dev/api/static/${item.name}_stat_usdt.png">`

        let tdimg2 = document.createElement('div')
        tdimg2.className = 'table-rating__td table-rating__pic table-rating__hide'
        tdimg2.innerHTML = `<img src="https://beta.membrana.dev/api/static/${item.name}_stat_btc.png">`

        let tdBalanceStat = document.createElement('div')
        tdBalanceStat.className = 'table-rating__td balance-stat table-rating__balance-stat table-rating__hide-mobile-two'
        tdBalanceStat.innerHTML = `
            <div>
              Current USDT: 
              <span class="usdt">${item.ltusdt.current}</span>
            </div>
            <div>
              Change USDT (7d): 
              <span class="usdt">${item.ltusdt.change.toFixed(2)}%</span>
            </div>
            <br>
            <div>
              Change BTC: 
              <span class="btc">${item.ltbtc.current}</span>
            </div>
            <div>
              Change BTC (7d): 
              <span class="btc">${item.ltbtc.current.toFixed(2)}%</span>
            </div>
          `

        let tdContractStat = document.createElement('div')
        tdContractStat.className = 'table-rating__td contract-stat table-rating__hide-mobile'
        tdContractStat.innerHTML = `
          <div>
            Positive: 
            <span>${item.contractStat.positive}</span>
          </div>
          <div>
            Negative: 
            <span>${item.contractStat.negative}</span>
          </div>
          <br>
          <br>
          <br>
        `

        let tdAvg = document.createElement('div')
        tdAvg.className = 'table-rating__td avg table-rating__avg'
        tdAvg.innerHTML = `
          <div>${item.contractStat.avg6.toFixed(2)}%</div>
        `

        let tdContractSattings = document.createElement('div')
        tdContractSattings.className = 'table-rating__td contract-settings'
        tdContractSattings.innerHTML = `
          <div>
            <span>Target: </span>
            <span>${item.contractSettings.roi}%</span>
          </div>
          <div>
            <span>Max loss: </span>
            <span>${item.contractSettings.maxLoss}</span>
          </div>
          <div>
            <span>Duration: </span>
            <span>${item.contractSettings.duration}</span>
          </div>
          <div>
            <span>Fee: </span>
            <span>${item.contractSettings.fee}%</span>
          </div>
          <div>
            <span>Currency: </span>
            <span>${item.contractSettings.currency}</span>
          </div>
          <div>
            <span>Min amount: </span>
            <span>${item.contractSettings.minAmount}</span>
          </div>
        `

        let tdBtn = document.createElement('div')
        tdBtn.className = 'table-rating__td table-rating__btn-invest'
        tdBtn.innerHTML = `
          <a class="table-rating__btn" href="https://beta.membrana.dev/${item.name}" target="_blank">INVEST NOW</a>
        `

        tableTr.append(tdName, tdimg1, tdimg2, tdBalanceStat, tdContractStat, tdAvg, tdContractSattings, tdBtn)
        fragmentTable.appendChild(tableTr)
        this.tableView++
      }

      document.querySelector('.table-rating__body').appendChild(fragmentTable)
      this.tableView += len

      document.querySelector('.rating__btn').addEventListener('click', (e) => {
        e.preventDefault()
        e.target.classList.add('rating__btn_show')
        this.tableRows(this.ratingTraders.length)
      })
    }

    createTable = () => {
      this.tableRows(10)

      $(document).on('click', '.table-rating__row', (e) => {
        let trader = e.currentTarget.getAttribute('data-trader')
        $('.autocomplete__input').val(`@${trader}`)
        document.querySelector('.trader-r__name').innerHTML = `@${trader}`
        this.selectedTrader = {
          name: trader
        }
        this.loaderOpen()
        this.calculate()
      })
    }

    calculateUsd = (usd = 0) => {
      document.querySelector('.income__usd').innerHTML = (this.results.result * usd).toFixed(1)
    }

    initSelect = function () {
      let trader = this.selectedTrader
      $('.autocomplete .history-container__input').val(`@${trader.name}`)
      document.querySelector('.trader-r__name').innerHTML = `@${trader.name}`
    }

    initDatapicer = function () {
      $('.datepicker').datepicker.language['en'] = {
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        today: 'Today',
        clear: 'Clean',
        dateFormat: 'dd.mm.yyyy',
        timeFormat: 'hh:ii',
        firstDay: 1
      }

      $('.datepicker').datepicker({
        startDate: new Date(2019, 0, 1),
        language: 'en',
        maxDate: new Date(),
        onSelect: (formattedDate, date, inst) => {
          this.loaderOpen()
          this.calculate()
          myDatepicker.hide()
        }
      })

      let myDatepicker = $('.datepicker').data('datepicker')

      if (myDatepicker) {
        myDatepicker.selectDate(new Date(2019, 0, 1))
      }

      $('.input-app__icon').on('click', function () {
        myDatepicker.show()
      })
    }
  }

  let myCalculate = null
  if ($('.index').length) {
    myCalculate = new Calculate($('#mySelect'), $('.history-container__usd'), $('.datepicker'))
  }
  /**
   * lavel
   */
  $('.level').on('click', function () {
    if (!$(this).hasClass('level_disabled')) {
      return
    }
    $('.level').addClass('level_disabled')
    $(this).toggleClass('level_disabled')
    $('.tokenholders__medal-row').removeClass('tokenholders__medal-row_visible')
    let dataLavael = $(this).data('level')
    $(`.tokenholders__medal-row-${dataLavael}`).toggleClass('tokenholders__medal-row_visible')

    let procent = $(this).data('value')
    let procentActive = $('.percent__value').html()
    let newProcent = +procentActive
    let duraction = 1

    if (procentActive > procent) {
      duraction = -duraction
    } else if (procentActive < procent) {
      duraction = +duraction
    } else {
      $('.percent__value').html(newProcent)
      return
    }

    let timer = setInterval(() => {
      newProcent += duraction
      if (newProcent === procent) {
        clearInterval(timer)
      }
      $('.percent__value').html(newProcent)
    }, 20)
  })
  /**
   * .cart-token radio
   */
  $('.cart-token').on('click', function (e) {
    $('.cart-token').removeClass('cart-token_active')
    $(e.currentTarget).addClass('cart-token_active')
    $('.token__btn').attr('href', e.currentTarget.dataset.link)
    $('.token__btn-name').html(` @ ${e.currentTarget.dataset.name}`)
  })
  /**
   * scroll-btn
   */
  $('.scroll-btn, .top__btn').on('click', function (e) {
    e.preventDefault()
    $('html, body').animate({ scrollTop: $('.investors').offset().top }, 2000)
  })
  /**
   * forms validade
   */
  $('.input').keypress(function () {
    $(this).removeClass('input_danger')
  })

  $('.opportunities__btn, .footer__btn, .sign-in__create').click(function () {
    var trigger = true
    $(this).closest('form').find('.input').each(function (i) {
      var _this = this
      if (!validate(_this, trigger)) {
        $(this).closest('.input').addClass('input_danger')
        trigger = false
      }
    })
    if (!trigger) return false
  })
  /**
   * input USD
   */
  $('.history-container__usd').on('change keyup input click', function (e) {
    if (this.value.match(/[^0-9]/g)) {
      this.value = this.value.replace(/[^0-9]/g, '')
    }
  })
  $('.history-container__usd').keyup(function (e) {
    if (e.target.value === '') {
      myCalculate.calculateUsd()
    } else {
      myCalculate.calculateUsd(e.target.value)
    }
  })

  function validate (_this, trigger) {
    var ckName = /^[А-Яа-яA-Za-z\s]{1,20}$/
    var ckText = /^[А-Яа-яA-Za-z0-9,.!?\s]{1,5000}$/
    var ckTel = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/
    var ckNumber = /^\d+$/
    var ckDate = /^(\d{1,2}).(\d{1,2}).(\d{2}|\d{4})$/
    var ckEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i

    var type = $(_this).attr('type')
    // console.log(type)
    if (type === 'number') {
      if (!ckNumber.test($(_this).val())) {
        return false
      } else {
        return true
      }
    } if (type === 'text') {
      if (!ckText.test($(_this).val())) {
        return false
      } else {
        return true
      }
    } if (type === 'password') {
      if (!ckText.test($(_this).val())) {
        return false
      } else {
        return true
      }
    } if (type === 'date') {
      console.log('date')
      if (!ckDate.test($(_this).val())) {
        return false
      } else {
        return true
      }
    } if (type === 'email') {
      if (!ckEmail.test($(_this).val())) {
        return false
      } else {
        return true
      }
    } if (type === 'tel') {
      if (!ckTel.test($(_this).val())) {
        return false
      } else {
        return true
      }
    } if (type === 'name') {
      if (!ckName.test($(_this).val())) {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  }

  /**
   * profit__btn
   */
  $('.profit__btn').on('click', function (e) {
    e.preventDefault()
    let selectetItem = $('.autocomplete .history-container__input')[0].value
    if (selectetItem[0] === '@') {
      selectetItem = selectetItem.slice(1, selectetItem.length)
    }
    sessionStorage.setItem('contact_with', selectetItem)
    window.location.href = '/sign-in/'
  })
  /**
   * opportunities__btn'
   */
  $('.opportunities__btn').on('click', function (e) {
    e.preventDefault()
    let valueInput = $('.opportunities__input')[0].value
    if (valueInput.length === 0) {
      return
    }
    $.get(`https://beta.membrana.dev/api/v2/profile/${valueInput}`, (data) => {
      if (data.error) {
        $('.opportunities__input-tooltip').addClass('opportunities__input-tooltip_is-active')
        $('.opportunities__input').addClass('input input_danger')
        setTimeout(() => {
          $('.opportunities__input').removeClass('jello-horizontal')
          $('.opportunities__input-tooltip').removeClass('opportunities__input-tooltip_is-active')
          $('.opportunities__input').val('')
        }, 2500)
        return
      }
      sessionStorage.setItem('contact_with', data.profile.name)
      window.location.href = '/sign-in/'
    })
  })
  /**
   * sign in
   */
  if ($('.sign-in__create').length) {
    checkSign()
  }

  function checkSign () {
    let nameTrader = sessionStorage.getItem('contact_with')
    if (nameTrader) {
      $.get(`https://beta.membrana.dev/api/v2/profile/${nameTrader}`, (data) => {
        $('.sign-in__user-login').html(data.profile.name)
        $('.sign-in__money').html(data.profile.totalInUSDT)

        if (data.profile.currentProfit[0]) {
          $('.sign-in__profit').html(data.profile.currentProfit[0].toFixed(2) + '%')
        }
      })
    }
  }
})()

/**
 * Select language
 */
;(() => {
  const $select = $('.js-select-language')
  const $current = $select.find('.select-language__current')
  const $item = $select.find('.select-language__item')

  $select.on('click', function (e) {
    $(this).addClass('active')
    e.stopPropagation()
  })

  $item.on('click', function (e) {
    $select.removeClass('active')
    e.stopPropagation()
  })

  $(document).on('click', function () {
    $select.removeClass('active')
  })

  $item.on('click', function (e) {
    if ($(this).hasClass('select-language__item_disabled')) {
      e.preventDefault()
    } else {
      $current.html($(this).html())
      $(this).addClass('active').siblings().removeClass('active')
    }
  })
})()

/**
 * Replace svg images with inline svg
 */
app.svgToInline = ($ctx = $('body')) => {
  const $images = $ctx.find('img[src$=".svg"]:not(.js-prevent-inline)')

  let imagesToLoad = $images.length

  $images.each(function () {
    const $img = $(this)
    const src = $img.attr('src')
    const className = ($img.attr('class') || '') + ' js-inlined-svg'

    $.get(src, (res) => {
      if (res.status !== 404) {
        const $svg = $(res).find('svg')

        $svg.find('title', 'desc').remove()

        $svg.attr('width') && $svg.css('width', (
          (parseInt(
            $svg.attr('width').replace('px', '')) / 10
          ) + 'rem')
        )

        $svg.attr('height') && $svg.css('height', (
          (parseInt(
            $svg.attr('height').replace('px', '')) / 10
          ) + 'rem')
        )

        !$svg.attr('viewBox') &&
        $svg.attr('height') &&
        $svg.attr('width') &&
        $svg.attr('viewBox', `0 0 ${$svg.attr('width')} ${$svg.attr('height')}`) &&
        $svg.attr('preserveAspectRatio', 'xMinYMin meet')

        $svg.find('*').each(function () {
          const $el = $(this)
          const urlRE = /^url\((.*)\)/g
          const hrefRE = /^#(.*)/g

          $.each($el.get(0).attributes, (i, attr) => {
            const name = attr.name
            const value = attr.value
            const url = urlRE.exec(value)
            const href = hrefRE.exec(value)
            const randId = ('id' + Math.random()).replace('.', '')

            if (url) {
              const id = url[1]
              $el.attr(name, `url(#${randId})`)
              $svg.find(id).attr('id', randId)
            }

            if (name === 'xlink:href' && href) {
              const id = href[0]
              $el.attr(name, `#${randId}`)
              $svg.find(id).attr('id', randId)
            }
          })
        })

        $svg.addClass(className).attr('ref', src)

        $img.replaceWith($svg)
      }

      imagesToLoad--
      if (imagesToLoad === 0) {
        $(window).trigger('imagesReady')
      }
    })
      .fail((e) => {
        imagesToLoad--
        if (imagesToLoad === 0) {
          $(window).trigger('imagesReady')
        }
      })
  })
}
app.svgToInline()

/**
 * Main navigation
 */
;(() => {
  // const $win = $(window)
  const $headerWrapper = $('.header-wrapper')
  // const $header = $('.header-wrapper').find('.header')

  $('.js-hamburger').on('click', function () {
    $('body').toggleClass('no-overflow')

    $(this).toggleClass('opened')
    $headerWrapper.find('.nav').toggleClass('opened')
  })

  if (!$('.app').is('.index')) return false

  // $win.on('load scroll', () => {
  //   if ($win.scrollTop() > $('.js-section:nth-child(2)').offset().top - $header.height()) {
  //     $headerWrapper.addClass('fixed')
  //   } else {
  //     $headerWrapper.removeClass('fixed')
  //   }
  // })
})()

/**
 * Scroll btn next
 */
;(() => {
  const $btnNext = $('.scroll-btn-next')
  const $sectionNext = $('.competition__profits')

  if (!$btnNext.length) return false

  $btnNext.on('click', () => {
    $('html, body').animate({ scrollTop: $sectionNext.offset().top })
  })
})()

/**
 * Scroll btn form
 */
// ;(() => {
//   const $btnForm = $('.scroll-btn-form, .binance__KYC')
//   const $formSection = $('.KYC_wr h2')

//   if (!$btnForm.length) return false

//   $btnForm.on('click', () => {
//     $('html, body').animate({ scrollTop: $formSection.offset().top }); return false
//   })
// })()

/**
 * Preloader
 */
$(window).on('imagesReady', () => {
  // const topImage = new Image()
  // topImage.src = '/static/img/headPic.png'

  setTimeout(() => {
    $('.app-preloader, .app-preloader__circle').fadeOut(500, function () {
      $(window).trigger('preloaded')
    })
  }, 500)

  // topImage.onload = hidePreloader
  // topImage.onerror = hidePreloader
})
/**
 * FAQ page animation
 */
$('.faq-item').on('click', function () {
  const $item = $(this)
  $item.toggleClass('active')
  $item.find('.faq-item__answer').slideToggle()
})
$('.faq-item__answer').on('click', (e) => e.stopPropagation())
