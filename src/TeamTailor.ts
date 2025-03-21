import type {
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

let TEAMTAILOR_JOB_SCRIPT_LOADED = false
export default class Teamtailor {
  private static API_VERSION = 20161108
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
    // Validate required fields
    if (!data.apiKey && !data.company) {
      if (data.jobsWidget) {
        data.jobsWidget.innerText = 'Missing API Key'
      }

      throw new Error('Missing API Key')
    }

    // Prepare and send the API request
    this.apiRequest(this.prepareRequest(data), (response) => {
      // Get the widget container or create a default one
      const widget =
        data.jobsWidget || document.getElementById('teamtailor-jobs-widget')
      const jobWrapper = this.createElement(
        'div',
        'teamtailor-jobs__job-wrapper'
      )
      widget.appendChild(jobWrapper)

      // Set texts from the response metadata
      this.texts = response.meta.texts

      // Update return types with names from the response texts
      const { length } = this.returnTypes
      for (let i = 0; i < length; ++i) {
        const { value } = this.returnTypes[i]
        if (this.texts[value]) {
          this.returnTypes[i].name = this.texts[value]
        }
      }

      // Add job data to the widget
      this.addToWrapper(widget, response, data)

      // Check if filters are needed
      const shouldAddFilters =
        ((data.companySelect ||
          data.departmentSelect ||
          data.locationSelect ||
          data.languageSelect ||
          data.regionSelect) &&
          (!data.preselectedDepartment || !data.preselectedLocation)) ||
        data.remoteStatusSelect ||
        data.roleSelect

      if (shouldAddFilters) {
        // Create a filters container and insert it before the job wrapper
        const filters: HTMLDivElement = this.createElement(
          'div',
          'teamtailor-jobs__filters'
        )
        widget.insertBefore(filters, jobWrapper)

        // Add company filter if enabled
        if (data.companySelect) {
          this.appendData('companies', widget, data)
        }

        // Add department filter if enabled and no preselected department
        if (data.departmentSelect && !data.preselectedDepartment) {
          this.appendData('departments', widget, data)
        }

        // Add role filter if enabled
        if (data.roleSelect) {
          this.appendData('roles', widget, data)
        }

        // Add region filter if enabled
        if (data.regionSelect) {
          this.appendData('regions', widget, data)
        }

        // Add location filter if enabled and no preselected location
        if (data.locationSelect && !data.preselectedLocation) {
          this.appendData('locations', widget, data)
        }

        // Add language filter if enabled and no preselected language
        if (data.languageSelect && !data.preselectedLanguage) {
          this.appendData('career-sites', widget, data)
        }

        // Add remote status filter if enabled
        if (data.remoteStatusSelect) {
          this.appendData('remote_statuses', widget, data)
        }
      }
    })
  }
  static run() {
    if (TEAMTAILOR_JOB_SCRIPT_LOADED) {
      return
    }
    TEAMTAILOR_JOB_SCRIPT_LOADED = true
    this.addStyles()
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
    let operator = ''
    if (!uri.endsWith('&') && !uri.endsWith('?')) {
      operator = uri.includes('?') ? '&' : '?'
    }
    return `${uri}${operator}api_key=${data.apiKey}&api_version=${this.API_VERSION}`
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
  private static addSelect(
    apiResponse: APIResponse,
    selector: string,
    widget: HTMLDivElement,
    wrapper: HTMLDivElement,
    data: InitData
  ) {
    let value: string, jobDataArr: JobData[]
    const getReturnType = (jobData: JobData) => {
        switch (selector) {
          case 'locations': {
            if (jobData.attributes) {
              return jobData.attributes.name && jobData.attributes.name !== ''
                ? jobData.attributes.name
                : jobData.attributes.city
            }
            return jobData.name
          }
          case 'remote_statuses':
            return jobData
          case 'career-sites': {
            return {
              name: jobData.attributes.name,
              value: jobData.attributes['language-code'],
            }
          }
        }

        return jobData.attributes ? jobData.attributes.name : jobData.name
      },
      createOptionElement = (unit: ReturnType | string) => {
        const content: string = (unit as ReturnType).name || (unit as string),
          value = (unit as ReturnType).value || (unit as string),
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
        unit: (Region | Department | Location | Role)[],
        selector: string
      ) => {
        let units: string[] = []
        const { length } = unit
        for (let i = 0; i < length; ++i) {
          units.push(getReturnType(unit[i] as any) as any)
        }
        units = units.filter((unit, i, arr) => arr.indexOf(unit) === i).sort()

        if (selector !== 'remote_statuses') {
          units.sort()
        }
        const { length: rLength } = units
        for (let i = 0; i < rLength; ++i) {
          selectElement.appendChild(createOptionElement(units[i]))
        }
      }
    if (selector === 'remote_statuses') {
      value = this.texts['all-remote-statuses']
      jobDataArr = apiResponse as any
    } else if (data.apiKey) {
      value = apiResponse.meta.texts.all
      jobDataArr = apiResponse.data
    } else {
      value = apiResponse.text as any
      jobDataArr = apiResponse.items as any
    }

    const selectElement = this.populateSelect(value, wrapper)
    selectElement.addEventListener('change', ({ target }) => {
      if (!(target instanceof HTMLSelectElement)) {
        return
      }
      if (target.value?.length > 0) {
        ;(data as any)[selector] = `"${target.value.replace(/&/g, '%26')}"`
      } else {
        ;(data as any)[selector] = ''
      }
      this.apiRequest(this.prepareRequest(data), (e) => {
        this.addToWrapper(widget, e, data)
      })
    })
    parseSelect(selectElement, jobDataArr as any, selector)
  }
  private static addStyles() {
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
    uri: string,
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
    request.open('GET', uri, true)
    request.onreadystatechange = ({ target }) => {
      if (
        target instanceof XMLHttpRequest &&
        target.readyState === 4 &&
        target.status >= 200 &&
        target.status < 400
      ) {
        response()
      }
    }
    request.send()
  }
  private static appendData(
    selector: string,
    container: HTMLDivElement,
    data: InitData
  ) {
    let uri: string

    if (data.apiKey) {
      uri = data.url || `https://api.teamtailor.com/v1/${selector}?`
      uri = this.addAPIKey(uri, data)

      switch (selector) {
        case 'locations':
          uri += '&fields[locations]=name,city'
          break
        case 'departments':
        case 'regions':
        case 'career-sites':
        case 'companies':
          uri += `&fields[${selector}]=name`
          break
      }

      if (data.companies) {
        uri += `&filter[company]=${data.companies}`
      }
    } else {
      uri = `https://tt.teamtailor.com/api/${selector}?company_id=${data.company}`
    }

    const selectWrapper: HTMLDivElement = this.createElement(
      'div',
      'teamtailor-jobs__select-wrapper'
    )
    container
      .querySelector('.teamtailor-jobs__filters')
      ?.appendChild(selectWrapper)

    if (selector === 'remote_statuses') {
      this.addSelect(
        this.returnTypes as any,
        selector,
        container,
        selectWrapper,
        data
      )
      return
    }
    this.handleFallback(
      uri,
      (resp) => {
        if (!resp.items?.length && !resp.data?.length) {
          return
        }
        this.addSelect(resp, selector, container, selectWrapper, data)
      },
      data
    )
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
    anchor.href = uri
    if (data.popup || new URL(uri).origin !== location.origin) {
      anchor.target = '_blank'
      anchor.rel = 'noreferrer'
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
        ((jobbdataArr = jobbdataArr!.concat(resp.data)),
        resp.links && resp.links.next)
      ) {
        const r = this.addAPIKey(resp.links.next, data)
        this.handleFallback(r, callback, data, jobbdataArr)
      } else {
        resp.data = jobbdataArr
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
    const { length } = unit
    for (let i = 0; i < length; i++) {
      switch (unit[i].type) {
        case 'departments':
          this.departments[unit[i].id] = (unit as Department[])[i]
          break
        case 'roles':
          this.roles[unit[i].id] = (unit as Role[])[i]
          break
        case 'locations':
          this.locations[unit[i].id] = (unit as Location[])[i]
          break
        case 'regions':
          this.regions[unit[i].id] = (unit as Region[])[i]
          break
      }
    }
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
  private static prepareRequest(data: InitData): string {
    let uri: string

    // Helper function to join common arguments
    const joinArguments = () =>
      ['department', 'role', 'regions', 'locations'].join(',')

    // Case 1: No API key provided
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

    // Case 2: API key provided
    uri = data.url || 'https://api.teamtailor.com/v1/jobs?'
    uri = `${this.addAPIKey(uri, data)}&`
    uri += `include=${joinArguments()}&`

    // Add fields for departments, roles, locations, and regions
    uri += 'fields[departments]=name&'
    uri += 'fields[roles]=name&'
    uri += 'fields[locations]=name,city&'
    uri += 'fields[regions]=name&'

    // Add limit (capped at 30)
    if (data.limit) {
      data.limit = Math.min(data.limit, 30)
      uri += `page[size]=${data.limit}&`
    }

    // Add feed filter (default to 'public' if not provided)
    if (data.feed) {
      uri += `filter[feed]=${data.feed}&`
    } else {
      uri += 'filter[feed]=public&'
    }

    // Add company filter
    if (data.companies) {
      uri += `filter[company]=${data.companies}&`
    }

    // Add department filter
    if (data.departments) {
      uri += `filter[department]=${data.departments}&`
    }

    // Add role filter
    if (data.roles) {
      uri += `filter[role]=${data.roles}&`
    }

    // Add preselected department filter
    if (data.preselectedDepartment) {
      uri += `filter[department]=${data.preselectedDepartment}&`
    }

    // Add preselected location filter
    if (data.preselectedLocation) {
      uri += `filter[locations]=${data.preselectedLocation}&`
    }

    // Add preselected language filter
    if (data.preselectedLanguage) {
      uri += `filter[language-code]=${data.preselectedLanguage}&`
    }

    // Add career-sites filter (if provided)
    if (data['career-sites']) {
      uri += `filter[language-code]=${data['career-sites'].replaceAll('"', '')}&`
    }

    // Add locations filter
    if (data.locations) {
      uri += `filter[locations]=${data.locations}&`
    }

    // Add regions filter
    if (data.regions) {
      uri += `filter[regions]=${data.regions}&`
    }

    // Add remote status filter
    if (data.remote_statuses) {
      uri += `filter[remote-status]=${data.remote_statuses}&`
    }

    if (uri.endsWith('?') || uri.endsWith('&')) {
      uri = uri.slice(0, -1)
    }

    return uri
  }
}
