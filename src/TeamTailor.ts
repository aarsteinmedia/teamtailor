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
      ].filter((el) => el !== null),
      spanLength = spanArr.length - 1

    for (let i = 0; i < spanLength; i++) {
      wrapperSpan.appendChild(spanArr[i])
      if (i < spanLength) {
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
  private static handleFallback(
    uri: string,
    callback: (resp: APIResponse) => void,
    data: InitData,
    jobbdataArr?: JobData[]
  ) {
    if (!jobbdataArr) {
      // eslint-disable-next-line no-param-reassign
      jobbdataArr = []
    }
    if (!data.apiKey) {
      this.apiRequest(uri, callback)
      return
    }

    this.apiRequest(uri, (resp) => {
      if (
        // eslint-disable-next-line no-param-reassign
        ((jobbdataArr = jobbdataArr?.concat(resp.data)),
        resp.links && resp.links.next)
      ) {
        const requestString = this.addAPIKey(resp.links.next, data)
        this.handleFallback(requestString, callback, data, jobbdataArr)
      } else {
        resp.data = jobbdataArr!
        callback(resp)
      }
    })
  }
  private static isURLInternal(jobData: JobData, data: InitData) {
    return (
      !!jobData.links['careersite-job-internal-url'] &&
      (!!jobData.attributes.internal || data.feed !== 'public')
    )
  }
  private static parseUnits(unit?: (Department | Location | Region | Role)[]) {
    if (!unit) {
      return
    }
    const { length } = this.returnTypes
    for (let i = 0; i < length; i++) {
      switch (unit[i].type) {
        case 'departments':
          this.departments[unit[i].id] = (unit as Department[])[i]
          break
        case 'locations':
          this.locations[unit[i].id] = (unit as Location[])[i]
          break
        case 'regions':
          this.regions[unit[i].id] = (unit as Region[])[i]
          break
        case 'roles':
          this.roles[unit[i].id] = (unit as Role[])[i]
          break
      }
    }
  }
  private static populateDOM(
    apiResponse: APIResponse,
    selector: string,
    a: HTMLElement,
    n: HTMLDivElement,
    data: InitData
  ) {
    let value: string, jobDataArr: JobData[]
    const getReturnType = (jobData: JobData): ReturnType => {
        if (selector === 'locations') {
          if (jobData.attributes) {
            if (jobData.attributes.name && jobData.attributes.name !== '') {
              return jobData.attributes.name as unknown as ReturnType
            }
            return jobData.attributes.city as unknown as ReturnType
          }
          return jobData.name as unknown as ReturnType
        }
        if (selector === 'remote_statuses') {
          return jobData as unknown as ReturnType
        }
        if (selector === 'career-sites') {
          return {
            name: jobData.attributes.name,
            value: jobData.attributes['language-code'],
          }
        }
        if (jobData.attributes) {
          return jobData.attributes.name as unknown as ReturnType
        }
        return jobData.name as unknown as ReturnType
      },
      createOptionElement = (returnType: ReturnType) => {
        const content = returnType.name || (returnType as unknown as string),
          value = returnType.value || (returnType as unknown as string),
          option: HTMLOptionElement = this.createElement(
            'option',
            null,
            content
          )
        option.value = value
        return option
      },
      parseSelect = (
        selectElement: HTMLSelectElement,
        jobDataArr: JobData[],
        selector: string
      ) => {
        let n,
          returnTypes: ReturnType[] = []
        const { length } = jobDataArr
        for (n = 0; n < length; ++n) {
          returnTypes.push(getReturnType(jobDataArr[n]))
        }
        for (
          returnTypes = returnTypes
            .filter((e, t, selector) => selector.indexOf(e) === t)
            .sort(),
            selector !== 'remote_statuses' && returnTypes.sort(),
            n = 0;
          n < returnTypes.length;
          ++n
        ) {
          selectElement.appendChild(createOptionElement(returnTypes[n]))
        }
      }
    if (selector === 'remote_statuses') {
      value = this.texts['all-remote-statuses']
      jobDataArr = apiResponse as unknown as JobData[]
    } else if (data.apiKey) {
      value = apiResponse.meta.texts.all
      jobDataArr = apiResponse.data
    } else {
      value = apiResponse.text as unknown as string
      jobDataArr = apiResponse.items!
    }

    const selectElement = this.populateSelect(value, n)
    selectElement.addEventListener('change', ({ target }: Event) => {
      // TODO: This needs bugfixing:
      if (target instanceof HTMLSelectElement && target.value?.length) {
        ;(this.returnTypes as any)[selector] =
          `"${target.value.replace(/&/g, '%26')}"`
      } else {
        ;(this.returnTypes as any)[selector] = ''
      }

      this.apiRequest(this.prepareRequest(data), (resp) => {
        this.addToWrapper(a, resp, data)
      })
    })

    parseSelect(selectElement, jobDataArr, selector) // this.roles
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
