import {
  APIResponse,
  Department,
  Departments,
  InitData,
  JobData,
  Location,
  Locations,
  Region,
  Regions,
  ReturnType,
  Role,
  Roles,
  Texts,
} from '@/types'

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
    this.apiRequest(this.prepareRequest(data), (t) => {
      const widget =
          data.jobsWidget || document.getElementById('teamtailor-jobs-widget'),
        jobWrapper = this.createElement('div', 'teamtailor-jobs__job-wrapper')
      widget.appendChild(jobWrapper)

      const { texts } = t.meta,
        { length } = this.returnTypes

      for (let i = 0; i < length; ++i) {
        const { value } = this.returnTypes[i]
        if (value in texts) {
          this.returnTypes[i].name = texts[value as keyof typeof texts]
        }
      }
      if (
        (this.addToWrapper(widget, t, data),
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
          this.appendData('companies', widget, data)
        }

        if (data.departmentSelect && !data.preselectedDepartment) {
          this.appendData('departments', widget, data)
        }

        if (data.roleSelect) {
          this.appendData('roles', widget, data)
        }

        if (data.regionSelect) {
          this.appendData('regions', widget, data)
        }

        if (data.locationSelect && !data.preselectedLocation) {
          this.appendData('locations', widget, data)
        }

        if (data.languageSelect && !data.preselectedLanguage) {
          this.appendData('career-sites', widget, data)
        }

        if (data.remoteStatusSelect) {
          this.appendData('remote_statuses', widget, data)
        }
      }
    })
  }
  static run() {
    if (
      !('TEAMTAILOR_JOB_SCRIPT_LOADED' in window) ||
      !window.TEAMTAILOR_JOB_SCRIPT_LOADED
    ) {
      ;(window as any).TEAMTAILOR_JOB_SCRIPT_LOADED = true

      this.appendChildren()

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
          roleSelect: jobsWidgets[i].getAttribute(
            'data-teamtailor-role-select'
          ),
        })
      }
    }
  }
  private static addAPIKey(uri: string, data: InitData) {
    return `${uri}&api_key=${data.apiKey}&api_version=20161108&`
  }
  private static addPagination(
    container: HTMLElement,
    apiResponse: APIResponse,
    data: InitData
  ) {
    const paginationWrapper: HTMLDivElement = this.createElement(
      'div',
      'teamtailor-jobs__pagination'
    )
    if (apiResponse.links.prev) {
      const anchor = this.addPaginatonLink('prev', container, apiResponse, data)
      paginationWrapper.appendChild(anchor)
    }
    if (
      (apiResponse.links.prev &&
        apiResponse.links.next &&
        paginationWrapper.appendChild(document.createTextNode(' \u2014 ')),
      apiResponse.links.next)
    ) {
      const anchor = this.addPaginatonLink('next', container, apiResponse, data)
      paginationWrapper.appendChild(anchor)
    }
    return paginationWrapper
  }
  private static addPaginatonLink(
    place: 'first' | 'last' | 'next' | 'prev',
    container: HTMLElement,
    apiResponse: APIResponse,
    data: InitData
  ) {
    const anchor: HTMLAnchorElement = this.createElement(
      'a',
      `teamtailor-jobs__pagination__${place}`,
      apiResponse.meta.texts[place]
    )
    anchor.setAttribute('href', apiResponse.links[place])
    anchor.addEventListener('click', (ev) => {
      ev.preventDefault()
      const i = this.addAPIKey(apiResponse.links[place], data)
      this.apiRequest(i, (resp) => {
        this.addToWrapper(container, resp, data)
      })
    })
    return anchor
  }
  private static addToWrapper(
    container: HTMLElement,
    apiResponse: APIResponse,
    data: InitData
  ) {
    let jobDataArr: JobData[] = []
    const wrapper: HTMLElement | null = container.querySelector(
      '.teamtailor-jobs__job-wrapper'
    )
    if (!wrapper) {
      throw new Error('Could not find wrapper')
    }
    wrapper.innerHTML = ''

    if (data.apiKey) {
      jobDataArr = apiResponse.data
      this.parseUnits(apiResponse.included)
    } else if (apiResponse.jobs) {
      jobDataArr = apiResponse.jobs
    }

    const { length } = jobDataArr

    for (let i = 0; i < length; ++i) {
      wrapper.appendChild(this.appendJobbData(jobDataArr[i], data))
    }
    if (data.pagination) {
      wrapper.appendChild(this.addPagination(container, apiResponse, data))
    }
  }
  private static apiRequest(
    data: string,
    callBack: (resp: APIResponse) => void
  ) {
    let request: XMLHttpRequest
    const isIE8 = 'XDomainRequest' in window,
      response = () => {
        callBack(JSON.parse(request.responseText))
      }
    if (isIE8) {
      request = new (window as any).XDomainRequest()
      request.onprogress = () => true
      request.onload = response
      request.open('GET', data)
      request.send()
      return
    }
    request = new XMLHttpRequest()
    request.open('GET', data, true)
    request.onreadystatechange = function () {
      if (this.readyState === 4 && this.status >= 200 && this.status < 400) {
        response()
      }
    }
    request.send()
  }
  private static appendChildren() {
    let styleContent = ''
    const headElement = document.head || document.querySelector('head'),
      styleElement = document.createElement('style')
    styleContent += '.teamtailor-jobs__job-title { display: block; }'
    styleContent += '.teamtailor-jobs__job { margin-bottom: 1em; }'
    styleContent +=
      '.teamtailor-jobs__select-wrapper { float: left; margin: 0 1em 1em 0; }'
    styleContent += '.teamtailor-jobs__job-wrapper { clear: left; }'

    if (
      'styleSheet' in styleElement &&
      styleElement.styleSheet instanceof CSSStyleDeclaration
    ) {
      // TODO: This looks like a mistake
      styleElement.styleSheet.cssText = styleContent

      headElement.appendChild(styleElement)
      return
    }
    styleElement.appendChild(document.createTextNode(styleContent))
    headElement.appendChild(styleElement)
  }
  private static appendData(
    selector: string,
    container: HTMLElement,
    data: InitData
  ) {
    let uri: string

    if (data.apiKey) {
      uri = `https://tt.teamtailor.com/api/${selector}?company_id=${data.company}`
    } else {
      uri = data.url || `https://api.teamtailor.com/v1/${selector}?`
      uri = this.addAPIKey(uri, data)

      switch (selector) {
        case 'locations':
          uri += '&fields[locations]=name,city'
          break
        case 'departments':
        case 'regions':
        case 'career-sites':
          uri += `&fields[${selector}]=name`
          break
      }

      if (data.companies) {
        uri += `&filter[company]=${data.companies}`
      }
    }

    const selectWrapper: HTMLDivElement = this.createElement(
      'div',
      'teamtailor-jobs__select-wrapper'
    )
    container
      .querySelectorAll('.teamtailor-jobs__filters')[0]
      .appendChild(selectWrapper)

    if (selector === 'remote_statuses') {
      // TODO: fix this
      this.populateDOM(
        this.returnTypes as any,
        selector,
        container,
        selectWrapper,
        data
      )
    } else {
      this.handleFallback(
        uri,
        (resp) => {
          if (
            (resp.items && resp.items.length) ||
            (resp.data && resp.data.length)
          ) {
            this.populateDOM(resp, selector, container, selectWrapper, data)
          }
        },
        data
      )
    }
  }
  private static appendJobbData(jobData: JobData, data: InitData) {
    const jobHolder: HTMLDivElement = this.createElement(
      'div',
      'teamtailor-jobs__job'
    )
    jobHolder.appendChild(this.createTitleLink(jobData, data))
    jobHolder.appendChild(this.createInfoSpan(jobData, data))
    return jobHolder
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
  private static createTitleLink(jobData: JobData, data: InitData) {
    const anchorString = jobData.title || jobData.attributes.title,
      anchor: HTMLAnchorElement = this.createElement(
        'a',
        'teamtailor-jobs__job-title',
        anchorString
      )
    let uri = this.isURLInternal(jobData, data)
      ? jobData.links['careersite-job-internal-url']
      : jobData.links['careersite-job-url']
    const source = uri.split('/')[2]

    uri += `?utm_campaign=jobs-widget&utm_source=${source}&utm_content=jobs&utm_medium=web`
    anchor.setAttribute('href', uri)
    if (data.popup) {
      anchor.setAttribute('target', '_blank')
    }
    return anchor
  }
  private static getDepartment(t) {
    const a = t.department_name
    if (a) {
      return a
    }
    if (t.relationships && t.relationships.department.data) {
      const n = this.departments[t.relationships.department.data.id]
      if (n) {
        return n.attributes.name
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
    if (jobData.relationships?.regions.data) {
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
    return null
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
  private static handleFallback(e, t, a, n) {
    void 0 === n && (n = []),
      a.apiKey
        ? this.apiRequest(e, (e) => {
            if (((n = n.concat(e.data)), e.links && e.links.next)) {
              const r = this.addAPIKey(e.links.next, a)
              this.handleFallback(r, t, a, n)
            } else {
              ;(e.data = n), t(e)
            }
          })
        : this.apiRequest(e, t)
  }
  private static isURLInternal(jobData: JobData, data: InitData) {
    return (
      !!jobData.links['careersite-job-internal-url'] &&
      (!!jobData.attributes.internal || data.feed !== 'public')
    )
  }
  private static parseUnits(r) {
    if (r) {
      for (let i = 0; i < this.returnTypes.length; i++) {
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
  private static populateDOM(
    e: ReturnType[],
    selector: string,
    a: HTMLElement,
    n: HTMLDivElement,
    r: InitData
  ) {
    let l, u
    const c = (e) => {
        if (selector === 'locations') {
          if (e.attributes) {
            if (e.attributes.name && e.attributes.name !== '') {
              return e.attributes.name
            }
            return e.attributes.city
          }
          return e.name
        }
        if (selector === 'remote_statuses') {
          return e
        }
        if (selector === 'career-sites') {
          return {
            name: e.attributes.name,
            value: e.attributes['language-code'],
          }
        }
        if (e.attributes) {
          return e.attributes.name
        }
        return e.name
      },
      m = (e) => {
        const t = e.name || e,
          a = e.value || e,
          option: HTMLOptionElement = this.createElement('option', null, t)
        option.value = a
        return option
      },
      p = (e, t, selector: string) => {
        let n,
          r = []
        for (n = 0; n < t.length; ++n) {
          r.push(this.parseUnits(t[n]))
        }
        for (
          r = r.filter((e, t, selector) => selector.indexOf(e) === t).sort(),
            selector !== 'remote_statuses' && r.sort(),
            n = 0;
          n < r.length;
          ++n
        ) {
          e.appendChild(m(r[n]))
        }
      }
    if (selector === 'remote_statuses') {
      l = te['all-remote-statuses']
      u = e
    } else if (r.apiKey) {
      l = e.meta.texts.all
      u = e.data
    } else {
      l = e.text
      u = e.items
    }

    const selectElement = this.populateSelect(l, n)
    selectElement.addEventListener('change', ({ target }: Event) => {
      if (target instanceof HTMLSelectElement && target.value?.length) {
        this.returnTypes[selector] = `"${target.value.replace(/&/g, '%26')}"`
      } else {
        this.returnTypes[selector] = ''
      }

      this.apiRequest(this.prepareRequest(r), (e) => {
        this.addToWrapper(a, e, r)
      })
    })

    p(selectElement, u, t)
  }
  private static populateSelect(value: string, container: HTMLElement) {
    const option: HTMLOptionElement = this.createElement('option', null, value)
    option.value = ''
    const select: HTMLSelectElement = this.createElement(
      'select',
      'teamtailor-jobs__select'
    )
    select.appendChild(option)
    container.appendChild(select)
    return select
  }
  private static prepareRequest(data: InitData) {
    let uri: string
    const joinArguments = () =>
      ['department', 'role', 'regions', 'locations'].join(',')

    if (!data.apiKey) {
      uri = data.url || 'https://tt.teamtailor.com/api/jobs?'

      if (data.limit) {
        uri += `limit=${data.limit}&`
      }
      if (data.preselectedDepartment) {
        uri += `department_name=${data.preselectedDepartment}&`
      }
      if (data.departments) {
        uri += `department_id=${data.departments}&`
      }
      if (data.locations) {
        uri += `location_id=${data.locations}&`
      }

      return `${uri}company_id=${data.company}`
    }
    if (
      ((uri = data.url || 'https://api.teamtailor.com/v1/jobs?'),
      (uri = `${(uri = this.addAPIKey(uri, data))}include=${joinArguments()}&`),
      (uri += 'fields[departments]=name&'),
      (uri += 'fields[roles]=name&'),
      (uri += 'fields[locations]=name,city&'),
      (uri += 'fields[regions]=name&'),
      data.limit &&
        ((data.limit = Math.min(data.limit, 30)),
        (uri = `${uri}page[size]=${data.limit}&`)),
      data.feed
        ? (uri = `${uri}filter[feed]=${data.feed}&`)
        : (uri += 'filter[feed]=public&'),
      data.companies && (uri = `${uri}filter[company]=${data.companies}&`),
      data.departments &&
        (uri = `${uri}filter[department]=${data.departments}&`),
      data.roles && (uri = `${uri}filter[role]=${data.roles}&`),
      data.preselectedDepartment &&
        (uri = `${uri}filter[department]=${data.preselectedDepartment}&`),
      data.preselectedLocation &&
        (uri = `${uri}filter[locations]=${data.preselectedLocation}&`),
      data.preselectedLanguage &&
        (uri = `${uri}filter[language-code]=${data.preselectedLanguage}&`),
      data['career-sites'])
    ) {
      uri = `${uri}filter[language-code]=${data['career-sites'].replaceAll(
        '"',
        ''
      )}&`
    }
    if (data.locations) {
      uri += `filter[locations]=${data.locations}&`
    }

    if (data.regions) {
      uri += `filter[regions]=${data.regions}&`
    }

    if (data.remote_statuses) {
      uri += `filter[remote-status]=${data.remote_statuses}&`
    }
    return uri
  }
}
