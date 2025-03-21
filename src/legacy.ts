/* eslint-disable no-confusing-arrow */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */

import {
  Departments,
  InitData,
  JobData,
  Locations,
  Regions,
  ReturnType,
  Roles,
  Texts,
} from '@/types'

/* eslint-disable @typescript-eslint/no-unused-expressions */
export default class Teamtailor {
  private static departments: Departments = {}
  private static locations: Locations = {}
  private static regions: Regions = {}
  private static returnTypes: ReturnType[] = [
    { value: 'none' },
    { value: 'temporary' },
    { value: 'hybrid' },
    { value: 'fully' },
  ]
  private static roles: Roles = {}
  private static texts: Texts = {}
  static init(data: InitData) {
    if (!data.apiKey && !data.company) {
      throw new Error('Missing API Key')
    }
    this.apiRequest(this.o(data), (t) => {
      const widget =
          data.jobsWidget || document.getElementById('teamtailor-jobs-widget'),
        jobWrapper = this.createElement('div', 'teamtailor-jobs__job-wrapper')
      widget.appendChild(jobWrapper)
      this.texts = t.meta.texts

      const { length } = this.returnTypes
      for (let i = 0; i < length; ++i) {
        const { value } = this.returnTypes[i]
        this.texts[value] && (this.returnTypes[i].name = this.texts[value])
      }
      if (
        (this.x(widget, t, data),
        ((data.companySelect ||
          data.departmentSelect ||
          data.locationSelect ||
          data.languageSelect ||
          data.regionSelect) &&
          (!data.preselectedDepartment || !data.preselectedLocation)) ||
          data.remoteStatusSelect ||
          data.roleSelect)
      ) {
        const filters: HTMLDivElement = this.createElement(
          'div',
          'teamtailor-jobs__filters'
        )
        widget.insertBefore(filters, jobWrapper)

        if (data.companySelect) {
          this.J('companies', widget, data)
        }

        if (data.departmentSelect && !data.preselectedDepartment) {
          this.J('departments', widget, data)
        }

        if (data.roleSelect) {
          this.J('roles', widget, data)
        }

        if (data.regionSelect) {
          this.J('regions', widget, data)
        }

        if (data.locationSelect && !data.preselectedLocation) {
          this.J('locations', widget, data)
        }

        if (data.languageSelect && !data.preselectedLanguage) {
          this.J('career-sites', widget, data)
        }

        if (data.remoteStatusSelect) {
          this.J('remote_statuses', widget, data)
        }
      }
    })
  }
  static run() {
    if (
      'TEAMTAILOR_JOB_SCRIPT_LOADED' in window &&
      window.TEAMTAILOR_JOB_SCRIPT_LOADED
    ) {
      return
    }
    ;(window as any).TEAMTAILOR_JOB_SCRIPT_LOADED = true
    this.O()
    const jobsWidgets: HTMLDivElement[] = Array.from(
        document.querySelectorAll('.teamtailor-jobs-widget')
      ),
      { length } = jobsWidgets
    for (let i = 0; i < length; ++i) {
      this.init({
        apiKey: jobsWidgets[i].getAttribute('data-teamtailor-api-key'),
        company: jobsWidgets[i].getAttribute('data-teamtailor-company'),
        companySelect: jobsWidgets[i].getAttribute(
          'data-teamtailor-group-company-select'
        ),
        departmentSelect: jobsWidgets[i].getAttribute(
          'data-teamtailor-department-select'
        ),
        feed: jobsWidgets[i].getAttribute('data-teamtailor-feed') || 'public',
        jobsWidget: jobsWidgets[i],
        languageSelect: jobsWidgets[i].getAttribute(
          'data-teamtailor-language-select'
        ),
        limit: jobsWidgets[i].getAttribute('data-teamtailor-limit')
          ? Number(jobsWidgets[i].getAttribute('data-teamtailor-limit'))
          : null,
        locationSelect: jobsWidgets[i].getAttribute(
          'data-teamtailor-location-select'
        ),
        pagination: jobsWidgets[i].getAttribute('data-teamtailor-pagination'),
        popup: jobsWidgets[i].getAttribute('data-teamtailor-popup'),
        preselectedDepartment: jobsWidgets[i].getAttribute(
          'data-teamtailor-department'
        ),
        preselectedLanguage: jobsWidgets[i].getAttribute(
          'data-teamtailor-language'
        ),
        preselectedLocation: jobsWidgets[i].getAttribute(
          'data-teamtailor-location'
        ),
        regionSelect: jobsWidgets[i].getAttribute(
          'data-teamtailor-region-select'
        ),
        remoteStatusSelect: jobsWidgets[i].getAttribute(
          'data-teamtailor-remote-status-select'
        ),
        roleSelect: jobsWidgets[i].getAttribute('data-teamtailor-role-select'),
      })
    }
  }
  private static addAPIKey(uri: string, data: InitData) {
    return `${uri}&api_key=${data.apiKey}&api_version=20161108&`
  }
  private static apiRequest(
    data: string,
    callBack: (resp: APIResponse) => void
  ) {
    // let request: XMLHttpRequest
    // const isIE8 = 'XDomainRequest' in window,
    const response = () => {
      callBack(JSON.parse(request.responseText))
    }
    // if (isIE8) {
    //   request = new (window as any).XDomainRequest()
    //   request.onprogress = () => true
    //   request.onload = response
    //   request.open('GET', data)
    //   request.send()
    //   return
    // }
    const request = new XMLHttpRequest()
    request.open('GET', data, true)
    request.onreadystatechange = function () {
      if (this.readyState === 4 && this.status >= 200 && this.status < 400) {
        response()
      }
    }
    request.send()
  }
  private static c(r) {
    if (r) {
      for (let i = 0; i < r.length; i++) {
        r[i].type === 'departments'
          ? (this.departments[r[i].id] = r[i])
          : r[i].type === 'roles'
            ? (this.roles[r[i].id] = r[i])
            : r[i].type === 'locations'
              ? (this.locations[r[i].id] = r[i])
              : r[i].type === 'regions' && (this.regions[r[i].id] = r[i])
      }
    }
  }
  private static C(e, t) {
    const a = this.createElement('div', 'teamtailor-jobs__job')
    a.appendChild(this.w(e, t))
    a.appendChild(this.createInfoSpan(e, t))
    return a
  }
  private static createCompanySpan(jobData: JobData) {
    const company = jobData.attributes['company-name']
    return company
      ? this.createElement<HTMLSpanElement>(
          'span',
          'teamtailor-jobs__company',
          company
        )
      : null
  }
  private static createDepartmentSpan(jobData: JobData) {
    const department = this.getDepartment(jobData)
    return department
      ? this.createElement<HTMLSpanElement>(
          'span',
          'teamtailor-jobs__department',
          department
        )
      : null
  }
  private static createElement<T extends HTMLElement>(
    tagName: string,
    className?: string | null,
    content?: string
  ) {
    const newElement = document.createElement(tagName) as T
    if (className) {
      newElement.className = className
    }
    if (content) {
      if (newElement.textContent) {
        newElement.textContent = content
        return newElement
      }
      newElement.innerText = content
    }
    return newElement
  }
  private static createInfoSpan(jobData: JobData, data: InitData) {
    const wrapperSpan: HTMLSpanElement = this.createElement(
        'span',
        'teamtailor-jobs__job-info'
      ),
      spanArr = [
        this.createCompanySpan(jobData),
        this.createDepartmentSpan(jobData),
        this.createRoleSpan(jobData),
        this.createRegionSpan(jobData),
        this.createLocationSpan(jobData),
        this.createStatusSpan(jobData, data),
      ].filter((e) => e !== null),
      { length } = spanArr

    for (let i = 0; i < length; i++) {
      wrapperSpan.appendChild(spanArr[i])
      if (i < length - 1) {
        wrapperSpan.appendChild(document.createTextNode(' - '))
      }
    }

    return wrapperSpan
  }
  private static createLocationSpan(jobData: JobData) {
    const location = this.getLocation(jobData)
    return location
      ? this.createElement<HTMLSpanElement>(
          'span',
          'teamtailor-jobs__location',
          location
        )
      : null
  }
  private static createRegionSpan(jobData: JobData) {
    const region = this.getRegion(jobData)
    return region
      ? this.createElement<HTMLSpanElement>(
          'span',
          'teamtailor-jobs__region',
          region
        )
      : null
  }
  private static createRoleSpan(jobData: JobData) {
    const role = this.getRole(jobData)
    return role
      ? this.createElement<HTMLSpanElement>(
          'span',
          'teamtailor-jobs__role',
          role
        )
      : null
  }
  private static createStatusSpan(jobData: JobData, data: InitData) {
    const status = this.getStatus(jobData)
    if (status && data.remoteStatusSelect) {
      return this.createElement<HTMLSpanElement>(
        'span',
        'teamtailor-jobs__remote_status',
        status
      )
    }
    return null
  }
  private static D(e, t) {
    const a = this.createElement('option', null, e)
    a.value = ''
    const n = this.createElement('select', 'teamtailor-jobs__select')
    n.appendChild(a)
    t.appendChild(n)
    return n
  }
  private static E(e, t, a, n, r) {
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
          n = this.createElement('option', null, t)
        return (n.value = a), n
      },
      p = (e, t, a) => {
        let n,
          r = []
        for (n = 0; n < t.length; ++n) {
          r.push(c(t[n]))
        }
        for (
          r = r
            .filter(function (e, t, a) {
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
      ? ((l = this.texts['all-remote-statuses']), (u = e))
      : r.apiKey
        ? ((l = e.meta.texts.all), (u = e.data))
        : ((l = e.text), (u = e.items))
    const d = this.D(l, n)
    d.addEventListener('change', (e) => {
      e.target.value && e.target.value.length > 0
        ? (r[t] = `"${e.target.value.replace(/&/g, '%26')}"`)
        : (r[t] = ''),
        this.apiRequest(this.o(r), (e) => {
          this.x(a, e, r)
        })
    }),
      p(d, u, t)
  }
  private static getDepartment(jobData: JobData) {
    const department = jobData.department_name
    if (department) {
      return department
    }
    if (jobData.relationships?.department.data) {
      const department =
        this.departments[jobData.relationships.department.data.id]
      if (department) {
        return department.attributes.name
      }
    }
    return null
  }
  private static getLocation(jobData: JobData) {
    const location = jobData.location_name
    if (location) {
      return location
    }
    if (jobData.relationships?.locations.data) {
      return jobData.relationships.locations.data
        .map((data) => {
          const loc = this.locations[data.id]
          if (loc) {
            if (loc.attributes.name && loc.attributes.name !== '') {
              return loc.attributes.name
            }
            return loc.attributes.city
          }
          return null
        })
        .join(', ')
    }
    return null
  }
  private static getRegion(jobData: JobData) {
    if (!jobData.relationships?.regions.data) {
      return null
    }
    return jobData.relationships.regions.data
      .map((data) => {
        const region = this.regions[data.id]
        if (region) {
          return region.attributes.name
        }
        return null
      })
      .join(', ')
  }
  private static getRole(jobData: JobData) {
    if (jobData.relationships?.role.data) {
      const role = this.roles[jobData.relationships.role.data.id]
      if (role) {
        return role.attributes.name
      }
    }
    return null
  }
  private static getStatus(jobData: JobData) {
    const status = jobData.attributes['remote-status'],
      returnType = this.returnTypes.find(({ value }) => value === status)
    return returnType?.name ?? status
  }
  private static J(e, t, a) {
    let n
    a.apiKey
      ? ((n = a.url || `https://api.teamtailor.com/v1/${e}?`),
        (n = this.addAPIKey(n, a)),
        e === 'locations'
          ? (n += '&fields[locations]=name,city')
          : e === 'departments'
            ? (n += '&fields[departments]=name')
            : e === 'regions'
              ? (n += '&fields[regions]=name')
              : e === 'career-sites' && (n += '&fields[career-site]=name'),
        a.companies && (n += `&filter[company]=${a.companies}`))
      : (n = `https://tt.teamtailor.com/api/${e}?company_id=${a.company}`)
    const i = this.createElement('div', 'teamtailor-jobs__select-wrapper')
    t.querySelectorAll('.teamtailor-jobs__filters')[0].appendChild(i)
    e === 'remote_statuses'
      ? this.E(this.returnTypes, e, t, i, a)
      : this.u(
          n,
          (n) => {
            ;((n.items && n.items.length) || (n.data && n.data.length)) &&
              this.E(n, e, t, i, a)
          },
          a
        )
  }
  private static k(e, t, a, n) {
    const r = this.createElement(
      'a',
      `teamtailor-jobs__pagination__${e}`,
      a.meta.texts[e]
    )
    return (
      r.setAttribute('href', a.links[e]),
      r.addEventListener('click', (r) => {
        r.preventDefault()
        const i = this.addAPIKey(a.links[e], n)
        this.apiRequest(i, (e) => {
          this.x(t, e, n)
        })
      }),
      r
    )
  }
  private static L(e, t, a) {
    const n = this.createElement('div', 'teamtailor-jobs__pagination')
    if (t.links.prev) {
      const r = this.k('prev', e, t, a)
      n.appendChild(r)
    }
    if (
      (t.links.prev &&
        t.links.next &&
        n.appendChild(document.createTextNode(' \u2014 ')),
      t.links.next)
    ) {
      const i = this.k('next', e, t, a)
      n.appendChild(i)
    }
    return n
  }
  private static o(e) {
    let t
    const a = () => ['department', 'role', 'regions', 'locations'].join(',')
    if (e.apiKey) {
      if (
        ((t = e.url || 'https://api.teamtailor.com/v1/jobs?'),
        (t = `${(t = this.addAPIKey(t, e))}include=${a()}&`),
        (t += 'fields[departments]=name&'),
        (t += 'fields[roles]=name&'),
        (t += 'fields[locations]=name,city&'),
        (t += 'fields[regions]=name&'),
        e.limit &&
          ((e.limit = Math.min(e.limit, 30)),
          (t = `${t}page[size]=${e.limit}&`)),
        e.feed
          ? (t = `${t}filter[feed]=${e.feed}&`)
          : (t += 'filter[feed]=public&'),
        e.companies && (t = `${t}filter[company]=${e.companies}&`),
        e.departments && (t = `${t}filter[department]=${e.departments}&`),
        e.roles && (t = `${t}filter[role]=${e.roles}&`),
        e.preselectedDepartment &&
          (t = `${t}filter[department]=${e.preselectedDepartment}&`),
        e.preselectedLocation &&
          (t = `${t}filter[locations]=${e.preselectedLocation}&`),
        e.preselectedLanguage &&
          (t = `${t}filter[language-code]=${e.preselectedLanguage}&`),
        e['career-sites'])
      ) {
        t = `${t}filter[language-code]=${e['career-sites'].replaceAll(
          '"',
          ''
        )}&`
      }
      e.locations && (t = `${t}filter[locations]=${e.locations}&`),
        e.regions && (t = `${t}filter[regions]=${e.regions}&`),
        e.remote_statuses &&
          (t = `${t}filter[remote-status]=${e.remote_statuses}&`)
    } else {
      ;(t = e.url || 'https://tt.teamtailor.com/api/jobs?'),
        e.limit && (t = `${t}limit=${e.limit}&`),
        e.preselectedDepartment &&
          (t = `${t}department_name=${e.preselectedDepartment}&`),
        e.departments && (t = `${t}department_id=${e.departments}&`),
        e.locations && (t = `${t}location_id=${e.locations}&`),
        (t = `${t}company_id=${e.company}`)
    }
    return t
  }
  private static O() {
    let e = ''
    const t = document.head || document.getElementsByTagName('head')[0],
      a = document.createElement('style')
    ;(e += '.teamtailor-jobs__job-title { display: block; }'),
      (e += '.teamtailor-jobs__job { margin-bottom: 1em; }'),
      (e +=
        '.teamtailor-jobs__select-wrapper { float: left; margin: 0 1em 1em 0; }'),
      (e += '.teamtailor-jobs__job-wrapper { clear: left; }'),
      (a.type = 'text/css'),
      a.styleSheet
        ? (a.styleSheet.cssText = e)
        : a.appendChild(document.createTextNode(e)),
      t.appendChild(a)
  }
  private static T(e, t) {
    return (
      !!e.links['careersite-job-internal-url'] &&
      (!!e.attributes.internal || t.feed !== 'public')
    )
  }
  private static u(e, t, a, n) {
    undefined === n && (n = [])
    a.apiKey
      ? this.apiRequest(e, (e) => {
          if (((n = n.concat(e.data)), e.links && e.links.next)) {
            const r = this.addAPIKey(e.links.next, a)
            this.u(r, t, a, n)
          } else {
            e.data = n
            t(e)
          }
        })
      : this.apiRequest(e, t)
  }
  private static w(e, t) {
    const a = e.title || e.attributes.title,
      n = this.createElement('a', 'teamtailor-jobs__job-title', a)
    let r = this.T(e, t)
      ? e.links['careersite-job-internal-url']
      : e.links['careersite-job-url']
    const i = r.split('/')[2]
    return (
      (r += `?utm_campaign=jobs-widget&utm_source=${
        i
      }&utm_content=jobs&utm_medium=web`),
      n.setAttribute('href', r),
      t.popup && n.setAttribute('target', '_blank'),
      n
    )
  }
  private static x(e, t, a) {
    let n
    const r = e.querySelectorAll('.teamtailor-jobs__job-wrapper')[0]
    r.innerHTML = ''
    a.apiKey ? ((n = t.data), this.c(t.included)) : (n = t.jobs)
    for (let i = 0; i < n.length; ++i) {
      r.appendChild(this.C(n[i], a))
    }
    a.pagination && r.appendChild(this.L(e, t, a))
  }
}
