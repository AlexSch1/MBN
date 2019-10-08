import $ from 'jquery'
import 'custom-select/src/css/custom-select.css'
import customSelect from 'custom-select'
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

      $.get('https://beta.membrana.io/api/v2/challenge/result?round=0', (data) => {
        this.traderJson = data.results
        this.initCalculate()
      })

      $.get('https://beta.membrana.io/api/v2/rating', (data) => {
        this.ratingTraders = data.rating
        this.createTable()
      })
    }

    loaderCpen = () => {
      $('.profit__flex').addClass('blur')
      $('.profit__loader').addClass('profit__loader_active')
    }

    loaderClose = () => {
      $('.profit__flex').removeClass('blur')
      $('.profit__loader').removeClass('profit__loader_active')
    }

    calculate = () => {
      let valueDataInput = $('.datepicker').val()
      let startDay = valueDataInput.substr(0, 2)
      let startMonth = valueDataInput.substr(3, 2)
      let startYear = valueDataInput.substr(6, 4)
      let startDate = new Date(`${startYear} ${startMonth} ${startDay}`).getTime()
      let investment = 1
      let dayStart = startDate
      let dayEnd = new Date()
      let totalDays = (dayEnd - dayStart) / (1000 * 60 * 60 * 24)
      let traderName = this.cstSel.value

      $('.trader-r__day-ago').html(`(${totalDays.toFixed(0)} days ago)`)
      $('.trader-r__full-date').html(`${startDay}/${startMonth}/${startYear}`)

      this.requestCalculate(traderName, startDate, investment)
    }

    requestCalculate = (trader, date, investment) => {
      $.get(`https://beta.membrana.io/api/v2/calculator?trader=${trader}&start=${date}&investment=${investment}`, (data) => {
        console.log(data)
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

        if (i >= len) {
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
        tdimg1.innerHTML = `<img src="https://beta.membrana.io/api/static/${item.name}_stat_usdt.png">`

        let tdimg2 = document.createElement('div')
        tdimg2.className = 'table-rating__td table-rating__pic table-rating__hide'
        tdimg2.innerHTML = `<img src="https://beta.membrana.io/api/static/${item.name}_stat_btc.png">`

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
          <a class="table-rating__btn" href="https://beta.membrana.io/${item.name}" target="_blank">INVEST NOW</a>
        `

        tableTr.append(tdName, tdimg1, tdimg2, tdBalanceStat, tdContractStat, tdAvg, tdContractSattings, tdBtn)
        fragmentTable.appendChild(tableTr)
      }

      document.querySelector('.table-rating__wrap').appendChild(fragmentTable)
      this.tableView += len

      document.querySelector('.rating__btn').addEventListener('click', (e) => {
        e.preventDefault()
        e.target.classList.add('rating__btn_show')
        this.tableRows(this.ratingTraders.length)
      })
    }

    createTable = () => {
      document.querySelector('.table-rating__wrap').innerHTML = ''

      let headTable = document.createElement('div')
      headTable.className = 'table-rating__head'
      headTable.innerHTML = `
          <div class="table-rating__th">Name</div>
          <div class="table-rating__th table-rating__hide">Balance Chart 7d, USDT</div>
          <div class="table-rating__th table-rating__hide">Balance Chart 7d, BTC</div>
          <div class="table-rating__th table-rating__hide-mobile-two">Balance Under Management</div>
          <div class="table-rating__th table-rating__hide-mobile">Contract Stats</div>
          <div class="table-rating__th">Average Monthly ROI</div>
          <div class="table-rating__th">Contract Settings</div>
          <div class="table-rating__th"></div>
        `

      document.querySelector('.table-rating__wrap').appendChild(headTable)

      this.tableRows(10)

      $(document).on('click', '.table-rating__row', (e) => {
        let trader = e.currentTarget.getAttribute('data-trader')
        let options = $('#mySelect')[0].options
        let selectTrader = 0
        for (let i = 0; i < options.length; i++) {
          if (options[i].value === trader) {
            selectTrader = i
          }
        }
        $('#mySelect')[0].options[selectTrader].selected = true
        this.cstSel.destroy()
        customSelect(document.getElementById('mySelect'))
        this.cstSel = document.querySelector('.customSelect').customSelect
        document.querySelector('.trader-r__name').innerHTML = this.cstSel.value
        this.loaderCpen()
        this.calculate()
      })
    }

    calculateUsd = (usd = 0) => {
      document.querySelector('.income__usd').innerHTML = (this.results.result * usd).toFixed(1)
    }

    initCalculate = function () {
      this.initSelect()
      this.initDatapicer()
    }

    initSelect = function () {
      let fragmentSelect = document.createDocumentFragment()

      this.traderJson.forEach((item, index) => {
        let option = document.createElement('option')
        option.value = `${item.name}`
        option.text = `@${item.name}`
        fragmentSelect.appendChild(option)
      })

      document.querySelector('#mySelect').appendChild(fragmentSelect)
      customSelect(document.getElementById('mySelect'))
      this.cstSel = document.querySelector('.customSelect').customSelect
      document.querySelector('.trader-r__name').innerHTML = this.cstSel.value
      this.cstSel.select.addEventListener('change', (e) => {
        this.loaderCpen()

        let traderName = this.cstSel.value

        document.querySelector('.trader-r__name').innerHTML = traderName
        this.calculate()
      })
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
          this.loaderCpen()
          this.calculate()
          myDatepicker.hide()
        }
      })

      let myDatepicker = $('.datepicker').data('datepicker')

      if (myDatepicker) {
        myDatepicker.selectDate(new Date(2019, 0, 1))
      }
    }
  }

  let myCalculate = new Calculate($('#mySelect'), $('.history-container__usd'), $('.datepicker'))

  /**
   * profit__btn
   */
  $('.profit__btn').on('click', function (e) {
    e.preventDefault()
    let selectetItem = $('#mySelect')[0].selectedIndex
    sessionStorage.setItem('contact_with', $('#mySelect')[0][selectetItem].value)
    window.location.href = '/sign-in/'
  })
  /**
   * .cart-token radio
   */
  $('.cart-token').on('click', function (e) {
    e.preventDefault()
    $('.cart-token').removeClass('cart-token_active')
    $(e.currentTarget).addClass('cart-token_active')
    $('.token__btn').attr('href', e.currentTarget.href)
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
   * sign in
   */
  if ($('.sign-in__create').length) {
    checkSign()
  }

  function checkSign () {
    let nameTrader = sessionStorage.getItem('contact_with')
    if (nameTrader) {
      $.get(`https://beta.membrana.io/api/v2/profile/${nameTrader}`, (data) => {
        $('.sign-in__user-login').html(data.profile.name)
        $('.sign-in__money').html(data.profile.totalInUSDT)
        $('.sign-in__profit').html(data.profile.currentProfit[0].toFixed(2) + '%')
      })
    }
  }
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
;(() => {
  const $btnForm = $('.scroll-btn-form, .binance__KYC')
  const $formSection = $('.KYC_wr h2')

  if (!$btnForm.length) return false

  $btnForm.on('click', () => {
    $('html, body').animate({ scrollTop: $formSection.offset().top }); return false
  })
})()

/**
 * Preloader
 */
$(window).on('imagesReady', () => {
  const topImage = new Image()
  topImage.src = '/static/img/headPic.png'

  const hidePreloader = setTimeout(() => {
    $('.app-preloader, .app-preloader__circle').fadeOut(500, function () {
      $(window).trigger('preloaded')
    })
  }, 500)

  topImage.onload = hidePreloader
  topImage.onerror = hidePreloader
})
