

/* eslint-disable @typescript-eslint/no-unused-expressions */
export default class Teamtailor {
  private static a = {}
  private static e = {}
  private static i = {}
  private static n = {}
  private static r = [
    { value: 'none' },
    { value: 'temporary' },
    { value: 'hybrid' },
    { value: 'fully' },
  ]
  private static t = {}
  static init(e) {
    e.company || e.apiKey
      ? this.s(this.o(e), (t) => {
        const a =
            e.jobsWidget || document.getElementById('teamtailor-jobs-widget'),
          n = this.g('div', 'teamtailor-jobs__job-wrapper')

        a.appendChild(n)
        this.i = t.meta.texts
        for (let o = 0; o < this.r.length; ++o) {
          const l = this.r[o].value

          this.i[l] && (this.r[o].name = this.i[l])
        }
        if (
          this.x(
            a, t, e
          ),
          (e.companySelect ||
            e.departmentSelect ||
            e.locationSelect ||
            e.languageSelect ||
            e.regionSelect) &&
            (!e.preselectedDepartment || !e.preselectedLocation) ||
            e.remoteStatusSelect ||
            e.roleSelect
        ) {
          const s = this.g('div', 'teamtailor-jobs__filters')

          a.insertBefore(s, n)
          e.companySelect && this.J(
            'companies', a, e
          )
          e.departmentSelect &&
          !e.preselectedDepartment &&
          this.J(
            'departments', a, e
          )
          e.roleSelect && this.J(
            'roles', a, e
          )
          e.regionSelect && this.J(
            'regions', a, e
          )
          e.locationSelect &&
          !e.preselectedLocation &&
          this.J(
            'locations', a, e
          )
          e.languageSelect &&
          !e.preselectedLanguage &&
          this.J(
            'career-sites', a, e
          )
          e.remoteStatusSelect && this.J(
            'remote_statuses', a, e
          )
        }
      })
      : alert('missing api key')
  }

  static run() {
    if (!window.TEAMTAILOR_JOB_SCRIPT_LOADED) {
      window.TEAMTAILOR_JOB_SCRIPT_LOADED = true
      this.O()
      for (
        let e = document.querySelectorAll('.teamtailor-jobs-widget'), t = 0;
        t < e.length;
        ++t
      ) {
        this.init({
          apiKey: e[t].getAttribute('data-teamtailor-api-key'),
          company: e[t].getAttribute('data-teamtailor-company'),
          companySelect: e[t].getAttribute('data-teamtailor-group-company-select'),
          departmentSelect: e[t].getAttribute('data-teamtailor-department-select'),
          feed: e[t].getAttribute('data-teamtailor-feed') || 'public',
          jobsWidget: e[t],
          languageSelect: e[t].getAttribute('data-teamtailor-language-select'),
          limit: e[t].getAttribute('data-teamtailor-limit'),
          locationSelect: e[t].getAttribute('data-teamtailor-location-select'),
          pagination: e[t].getAttribute('data-teamtailor-pagination'),
          popup: e[t].getAttribute('data-teamtailor-popup'),
          preselectedDepartment: e[t].getAttribute('data-teamtailor-department'),
          preselectedLanguage: e[t].getAttribute('data-teamtailor-language'),
          preselectedLocation: e[t].getAttribute('data-teamtailor-location'),
          regionSelect: e[t].getAttribute('data-teamtailor-region-select'),
          remoteStatusSelect: e[t].getAttribute('data-teamtailor-remote-status-select'),
          roleSelect: e[t].getAttribute('data-teamtailor-role-select'),
        })
      }
    }
  }

  private static _(e) {
    const t = this.m(e)

    return t ? this.g(
      'span', 'teamtailor-jobs__department', t
    ) : null
  }

  private static A(e, t) {
    const a = this.g('span', 'teamtailor-jobs__job-info'),
      n = [
        this.v(e),
        this._(e),
        this.h(e),
        this.y(e),
        this.j(e),
        this.S(e, t),
      ].filter((e) => e !== null),
      r = n.length - 1

    return (
      n.forEach((e, t) => {
        a.appendChild(e)
        t < r && a.appendChild(document.createTextNode(' - '))
      }),
      a
    )
  }

  private static b(e) {
    const t = e.attributes['remote-status'],
      a = this.r.find(function (e) {
        return e.value === t
      })

    return a?.name ? a.name : t
  }

  private static c(r) {
    if (r) {
      for (const element of r) {
        element.type === 'departments'
          ? this.e[element.id] = element
          : element.type === 'roles'
            ? this.t[element.id] = element
            : element.type === 'locations'
              ? this.a[element.id] = element
              : element.type === 'regions' && (this.n[element.id] = element)
      }
    }
  }

  private static C(e, t) {
    const a = this.g('div', 'teamtailor-jobs__job')

    a.appendChild(this.w(e, t))
    a.appendChild(this.A(e, t))

    return a
  }

  private static d(e) {
    const t = e.location_name

    return (
      t ||
      (e.relationships?.locations.data
        ? e.relationships.locations.data
          .map((e) => {
            const t = this.a[e.id]

            return t
              ? t.attributes.name && t.attributes.name !== ''
                ? t.attributes.name
                : t.attributes.city
              : null
          })
          .join(', ')
        : null)
    )
  }

  private static D(e, t) {
    const a = this.g(
      'option', null, e
    )

    a.value = ''
    const n = this.g('select', 'teamtailor-jobs__select')

    n.appendChild(a)
    t.appendChild(n)

    return n
  }

  private static E(
    e, t, a, n, r
  ) {
    let l,
      u,
      c = (e) =>
        t === 'locations'
          ? e.attributes
            ? e.attributes.name && e.attributes.name !== ''
              ? e.attributes.name
              : e.attributes.city
            : e.name
          : t === 'remote_statuses'
            ? e
            : t === 'career-sites'
              ? {
                name: e.attributes.name,
                value: e.attributes['language-code'],
              }
              : e.attributes
                ? e.attributes.name
                : e.name,
      m = (e) => {
        const t = e.name || e,
          a = e.value || e,
          n = this.g(
            'option', null, t
          )

        return n.value = a, n
      },
      p = (
        e, t, a
      ) => {
        let n,
          r = []

        for (n = 0; n < t.length; ++n) {
          r.push(c(t[n]))
        }
        for (
          r = r
            .filter(function (
              e, t, a
            ) {
              return a.indexOf(e) === t
            })
            .sort(),
          a !== 'remote_statuses' && r.sort(),
          n = 0;
          n < r.length;
          ++n
        ) {
          e.appendChild(m(r[n]))
        }
      }

    t === 'remote_statuses'
      ? (l = this.i['all-remote-statuses'], u = e)
      : r.apiKey
        ? (l = e.meta.texts.all, u = e.data)
        : (l = e.text, u = e.items)
    const d = this.D(l, n)

    d.addEventListener('change', (e) => {
      e.target.value && e.target.value.length > 0
        ? r[t] = `"${e.target.value.replaceAll('&', '%26')}"`
        : r[t] = '',
      this.s(this.o(r), (e) => {
        this.x(
          a, e, r
        )
      })
    }),
    p(
      d, u, t
    )
  }

  private static f(e) {
    return e.relationships?.regions.data
      ? e.relationships.regions.data
        .map((e) => {
          const t = this.n[e.id]

          return t ? t.attributes.name : null
        })
        .join(', ')
      : null
  }

  private static g(
    e, t, a
  ) {
    const n = document.createElement(e)

    return (
      t && (n.className = t),
      a &&
      (undefined !== n.textContent ? n.textContent = a : n.innerText = a),
      n
    )
  }

  private static h(e) {
    const t = this.p(e)

    return t ? this.g(
      'span', 'teamtailor-jobs__role', t
    ) : null
  }

  private static j(e) {
    const t = this.d(e)

    return t ? this.g(
      'span', 'teamtailor-jobs__location', t
    ) : null
  }

  private static J(
    e, t, a
  ) {
    let n

    a.apiKey
      ? (n = a.url || `https://api.teamtailor.com/v1/${e}?`,
      n = this.l(n, a),
      e === 'locations'
        ? n += '&fields[locations]=name,city'
        : e === 'departments'
          ? n += '&fields[departments]=name'
          : e === 'regions'
            ? n += '&fields[regions]=name'
            : e === 'career-sites' && (n += '&fields[career-site]=name'),
      a.companies && (n += `&filter[company]=${a.companies}`))
      : n = `https://tt.teamtailor.com/api/${e}?company_id=${a.company}`
    const i = this.g('div', 'teamtailor-jobs__select-wrapper')

    t.querySelectorAll('.teamtailor-jobs__filters')[0].appendChild(i)
    e === 'remote_statuses'
      ? this.E(
        this.r, e, t, i, a
      )
      : this.u(
        n,
        (n) => {
          ;(n.items?.length || n.data?.length) &&
          this.E(
            n, e, t, i, a
          )
        },
        a
      )
  }

  private static k(
    e, t, a, n
  ) {
    const r = this.g(
      'a', `teamtailor-jobs__pagination__${e}`, a.meta.texts[e]
    )

    return (
      r.setAttribute('href', a.links[e]),
      r.addEventListener('click', (r) => {
        r.preventDefault()
        const i = this.l(a.links[e], n)

        this.s(i, (e) => {
          this.x(
            t, e, n
          )
        })
      }),
      r
    )
  }

  private static l(e, t) {
    return `${e}&api_key=${t.apiKey}&api_version=20161108&`
  }

  private static L(
    e, t, a
  ) {
    const n = this.g('div', 'teamtailor-jobs__pagination')

    if (t.links.prev) {
      const r = this.k(
        'prev', e, t, a
      )

      n.appendChild(r)
    }
    if (
      t.links.prev &&
      t.links.next &&
      n.appendChild(document.createTextNode(' \u2014 ')),
      t.links.next
    ) {
      const i = this.k(
        'next', e, t, a
      )

      n.appendChild(i)
    }

    return n
  }

  private static m(t) {
    const a = t.department_name

    if (a) {
      return a
    }
    if (t.relationships?.department.data) {
      const n = this.e[t.relationships.department.data.id]

      if (n) {
        return n.attributes.name
      }
    }

    return null
  }

  private static o(e) {
    let t
    const a = () => ['department',
      'role',
      'regions',
      'locations'].join(',')

    if (e.apiKey) {
      if (
        t = e.url || 'https://api.teamtailor.com/v1/jobs?',
        t = `${t = this.l(t, e)}include=${a()}&`,
        t += 'fields[departments]=name&',
        t += 'fields[roles]=name&',
        t += 'fields[locations]=name,city&',
        t += 'fields[regions]=name&',
        e.limit &&
        (e.limit = Math.min(e.limit, 30),
        t = `${t}page[size]=${e.limit}&`),
        e.feed
          ? t = `${t}filter[feed]=${e.feed}&`
          : t += 'filter[feed]=public&',
        e.companies && (t = `${t}filter[company]=${e.companies}&`),
        e.departments && (t = `${t}filter[department]=${e.departments}&`),
        e.roles && (t = `${t}filter[role]=${e.roles}&`),
        e.preselectedDepartment &&
        (t = `${t}filter[department]=${e.preselectedDepartment}&`),
        e.preselectedLocation &&
        (t = `${t}filter[locations]=${e.preselectedLocation}&`),
        e.preselectedLanguage &&
        (t = `${t}filter[language-code]=${e.preselectedLanguage}&`),
        e['career-sites']
      ) {
        t = `${t}filter[language-code]=${e['career-sites'].replaceAll('"',
          '')}&`
      }
      e.locations && (t = `${t}filter[locations]=${e.locations}&`),
      e.regions && (t = `${t}filter[regions]=${e.regions}&`),
      e.remote_statuses &&
      (t = `${t}filter[remote-status]=${e.remote_statuses}&`)
    } else {
      ;t = e.url || 'https://tt.teamtailor.com/api/jobs?',
      e.limit && (t = `${t}limit=${e.limit}&`),
      e.preselectedDepartment &&
      (t = `${t}department_name=${e.preselectedDepartment}&`),
      e.departments && (t = `${t}department_id=${e.departments}&`),
      e.locations && (t = `${t}location_id=${e.locations}&`),
      t = `${t}company_id=${e.company}`
    }

    return t
  }

  private static O() {
    let e = ''
    const t = document.head || document.getElementsByTagName('head')[0],
      a = document.createElement('style')

    e += '.teamtailor-jobs__job-title { display: block; }',
    e += '.teamtailor-jobs__job { margin-bottom: 1em; }',
    e +=
      '.teamtailor-jobs__select-wrapper { float: left; margin: 0 1em 1em 0; }',
    e += '.teamtailor-jobs__job-wrapper { clear: left; }',
    a.type = 'text/css',
    a.styleSheet
      ? a.styleSheet.cssText = e
      : a.appendChild(document.createTextNode(e)),
    t.appendChild(a)
  }

  private static p(e) {
    if (e.relationships?.role.data) {
      const a = this.t[e.relationships.role.data.id]

      if (a) {
        return a.attributes.name
      }
    }

    return null
  }

  private static s(e, t) {
    let a
    const n = !!window.XDomainRequest,
      r = () => {
        t(JSON.parse(a.responseText))
      }

    n
      ? ((a = new window.XDomainRequest()).onprogress = () => !0,
      a.onload = r,
      a.open('GET', e),
      a.send())
      : ((a = new XMLHttpRequest()).open(
        'GET', e, !0
      ),
      a.onreadystatechange = function () {
        this.readyState === 4 &&
        this.status >= 200 &&
        this.status < 400 &&
        r()
      },
      a.send())
  }

  private static S(e, t) {
    const a = this.b(e)

    return a && t.remoteStatusSelect
      ? this.g(
        'span', 'teamtailor-jobs__remote_status', a
      )
      : null
  }

  private static T(e, t) {
    return (
      !!e.links['careersite-job-internal-url'] &&
      (!!e.attributes.internal || t.feed !== 'public')
    )
  }

  private static u(
    e, t, a, n
  ) {
    undefined === n && (n = [])
    a.apiKey
      ? this.s(e, (e) => {
        if (n = n.concat(e.data), e.links?.next) {
          const r = this.l(e.links.next, a)

          this.u(
            r, t, a, n
          )
        } else {
          e.data = n
          t(e)
        }
      })
      : this.s(e, t)
  }

  private static v(e) {
    const t = e.attributes['company-name']

    return t ? this.g(
      'span', 'teamtailor-jobs__company', t
    ) : null
  }

  private static w(e, t) {
    const a = e.title || e.attributes.title,
      n = this.g(
        'a', 'teamtailor-jobs__job-title', a
      )
    let r = this.T(e, t)
      ? e.links['careersite-job-internal-url']
      : e.links['careersite-job-url']
    const i = r.split('/')[2]

    return (
      r += `?utm_campaign=jobs-widget&utm_source=${
        i
      }&utm_content=jobs&utm_medium=web`,
      n.setAttribute('href', r),
      t.popup && n.setAttribute('target', '_blank'),
      n
    )
  }

  private static x(
    e, t, a
  ) {
    let n
    const r = e.querySelectorAll('.teamtailor-jobs__job-wrapper')[0]

    r.innerHTML = ''
    a.apiKey ? (n = t.data, this.c(t.included)) : n = t.jobs
    for (const element of n) {
      r.appendChild(this.C(element, a))
    }
    a.pagination && r.appendChild(this.L(
      e, t, a
    ))
  }

  private static y(e) {
    const t = this.f(e)

    return t ? this.g(
      'span', 'teamtailor-jobs__region', t
    ) : null
  }
}
