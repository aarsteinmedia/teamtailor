import { APIResponse, InitData, JobData } from '@/types'

const Teamtailor = (() => {
  const departments = {},
    /** t */
    roles = {},
    locations = {},
    regions = {},
    returnTypes = [
      { value: 'none' },
      { value: 'temporary' },
      { value: 'hybrid' },
      { value: 'fully' },
    ]
  /** i */
  const texts = {}
  /** o */
  const prepareRequest = (data: InitData) => {
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
        (uri = `${(uri = addAPIKey(uri, data))}include=${joinArguments()}&`),
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
    },
    addAPIKey = (e, t) => `${e}&api_key=${t.apiKey}&api_version=20161108&`,
    apiRequest = (
      data: string,
      callBack: (resp: {
        meta: {
          texts: {
            none: string
            temporary: string
            hybrid: string
            fully: string
          }
        }
      }) => void
    ) => {
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
    },
    handleFallback = (e, t, a, n) => {
      void 0 === n && (n = []),
        a.apiKey
          ? apiRequest(e, function (e) {
              if (((n = n.concat(e.data)), e.links && e.links.next)) {
                const r = addAPIKey(e.links.next, a)
                handleFallback(r, t, a, n)
              } else {
                ;(e.data = n), t(e)
              }
            })
          : apiRequest(e, t)
    },
    /** c */
    parseUnits = (r) => {
      if (r) {
        for (let i = 0; i < returnTypes.length; i++) {
          r[i].type === 'departments'
            ? (departments[r[i].id] = r[i])
            : r[i].type === 'roles'
              ? (roles[r[i].id] = r[i])
              : r[i].type === 'locations'
                ? (locations[r[i].id] = r[i])
                : r[i].type === 'regions' && (regions[r[i].id] = r[i])
        }
      }
    },
    /** m */
    getDepartment = (t) => {
      const a = t.department_name
      if (a) {
        return a
      }
      if (t.relationships && t.relationships.department.data) {
        const n = departments[t.relationships.department.data.id]
        if (n) {
          return n.attributes.name
        }
      }
      return null
    },
    /** p */
    getRole = (jobData: JobData) => {
      if (jobData.relationships?.role.data) {
        const role = roles[jobData.relationships.role.data.id]
        if (role) {
          return role.attributes.name
        }
      }
      return null
    },
    /** d */
    getLocation = (jobData: JobData) => {
      const location = jobData.location_name
      if (location) {
        return location
      }
      if (jobData.relationships?.locations.data) {
        return jobData.relationships.locations.data
          .map((data) => {
            const loc = locations[data.id]
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
    },
    /** f */
    getRegion = (jobData: JobData) => {
      if (jobData.relationships?.regions.data) {
        return jobData.relationships.regions.data
          .map((data) => {
            const region = regions[data.id]
            if (region) {
              return region.attributes.name
            }
            return null
          })
          .join(', ')
      }
      return null
    },
    /** b */
    getStatus = (jobData: JobData) => {
      const status = jobData.attributes['remote-status'],
        returnType = returnTypes.find(({ value }) => value === status)
      return returnType?.name ?? status
    },
    createElement = <T extends HTMLElement>(
      tagName: string,
      className?: string | null,
      content?: string
    ) => {
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
    },
    /** v */
    createCompanySpan = (e) => {
      const t = e.attributes['company-name']
      return t ? createElement('span', 'teamtailor-jobs__company', t) : null
    },
    /** _ */
    createDepartmentSpan = (e) => {
      const t = getDepartment(e)
      return t ? createElement('span', 'teamtailor-jobs__department', t) : null
    },
    /** h */
    createRoleSpan = (e) => {
      const t = getRole(e)
      return t ? createElement('span', 'teamtailor-jobs__role', t) : null
    },
    /** y */
    createRegionSpan = (e) => {
      const t = getRegion(e)
      return t ? createElement('span', 'teamtailor-jobs__region', t) : null
    },
    /** j */
    createLocationSpan = (jobData: JobData) => {
      const location = getLocation(jobData)
      return location
        ? createElement('span', 'teamtailor-jobs__location', location)
        : null
    },
    /** S */
    createStatusSpan = (jobData: JobData, data: InitData) => {
      const status = getStatus(jobData)
      if (status && data.remoteStatusSelect) {
        return createElement('span', 'teamtailor-jobs__remote_status', status)
      }
      return null
    },
    /** A */
    createInfoSpan = (jobData: JobData, data: InitData) => {
      const span: HTMLSpanElement = createElement(
          'span',
          'teamtailor-jobs__job-info'
        ),
        n = [
          createCompanySpan(jobData),
          createDepartmentSpan(jobData),
          createRoleSpan(jobData),
          createRegionSpan(jobData),
          createLocationSpan(jobData),
          createStatusSpan(jobData, data),
        ].filter(function (e) {
          return e != null
        }),
        r = n.length - 1
      n.forEach(function (e, t) {
        span.appendChild(e)
        if (t < r) {
          span.appendChild(document.createTextNode(' - '))
        }
      })
      return span
    },
    /** T */
    isURLInternal = (jobData: JobData, data: InitData) =>
      !!jobData.links['careersite-job-internal-url'] &&
      (!!jobData.attributes.internal || data.feed !== 'public'),
    /** w */
    createTitleLink = (jobData: JobData, data: InitData) => {
      const anchorString = jobData.title || jobData.attributes.title,
        anchor: HTMLAnchorElement = createElement(
          'a',
          'teamtailor-jobs__job-title',
          anchorString
        )
      let uri = isURLInternal(jobData, data)
        ? jobData.links['careersite-job-internal-url']
        : jobData.links['careersite-job-url']
      const source = uri.split('/')[2]

      uri += `?utm_campaign=jobs-widget&utm_source=${source}&utm_content=jobs&utm_medium=web`
      anchor.setAttribute('href', uri)
      if (data.popup) {
        anchor.setAttribute('target', '_blank')
      }
      return anchor
    },
    appendJobbData = (jobData: JobData, data: InitData) => {
      const jobHolder: HTMLDivElement = createElement(
        'div',
        'teamtailor-jobs__job'
      )
      jobHolder.appendChild(createTitleLink(jobData, data))
      jobHolder.appendChild(createInfoSpan(jobData, data))
      return jobHolder
    },
    addToWrapper = (
      container: HTMLElement,
      apiResponse: APIResponse,
      data: InitData
    ) => {
      let n: JobData[] = []
      const wrapper: HTMLElement | null = container.querySelector(
        '.teamtailor-jobs__job-wrapper'
      )
      if (!wrapper) {
        throw new Error('Could not find wrapper')
      }
      wrapper.innerHTML = ''

      if (data.apiKey) {
        n = apiResponse.data
        parseUnits(apiResponse.included)
      } else if (apiResponse.jobs) {
        n = apiResponse.jobs
      }

      const { length } = n

      for (let i = 0; i < length; ++i) {
        wrapper.appendChild(appendJobbData(n[i], data))
      }
      if (data.pagination) {
        wrapper.appendChild(addPagination(container, apiResponse, data))
      }
    },
    addPagination = (
      container: HTMLElement,
      apiResponse: APIResponse,
      data: InitData
    ) => {
      const paginationWrapper: HTMLDivElement = createElement(
        'div',
        'teamtailor-jobs__pagination'
      )
      if (apiResponse.links.prev) {
        const anchor = addPaginatonLink('prev', container, apiResponse, data)
        paginationWrapper.appendChild(anchor)
      }
      if (
        (apiResponse.links.prev &&
          apiResponse.links.next &&
          paginationWrapper.appendChild(document.createTextNode(' \u2014 ')),
        apiResponse.links.next)
      ) {
        const anchor = addPaginatonLink('next', container, apiResponse, data)
        paginationWrapper.appendChild(anchor)
      }
      return paginationWrapper
    },
    addPaginatonLink = (
      place: 'first' | 'last',
      container: HTMLElement,
      apiResponse: APIResponse,
      data: InitData
    ) => {
      const anchor: HTMLAnchorElement = createElement(
        'a',
        `teamtailor-jobs__pagination__${place}`,
        apiResponse.meta.texts[place]
      )
      anchor.setAttribute('href', apiResponse.links[place])
      anchor.addEventListener('click', (ev) => {
        ev.preventDefault()
        const i = addAPIKey(apiResponse.links[place], data)
        apiRequest(i, (resp) => {
          addToWrapper(container, resp, data)
        })
      })
      return anchor
    },
    populateSelect = (value: string, container: HTMLElement) => {
      const option: HTMLOptionElement = createElement('option', null, value)
      option.value = ''
      const select: HTMLSelectElement = createElement(
        'select',
        'teamtailor-jobs__select'
      )
      select.appendChild(option)
      container.appendChild(select)
      return select
    },
    populateDOM = (
      e: ReturnType[],
      selector: string,
      a: HTMLElement,
      n: HTMLDivElement,
      r: InitData
    ) => {
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
            r.push(parseUnits(t[n]))
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

      const selectElement = populateSelect(l, n)
      selectElement.addEventListener('change', ({ target }: Event) => {
        if (target instanceof HTMLSelectElement && target.value?.length) {
          returnTypes[selector] = `"${target.value.replace(/&/g, '%26')}"`
        } else {
          returnTypes[selector] = ''
        }

        apiRequest(prepareRequest(r), (e) => {
          addToWrapper(a, e, r)
        })
      })

      p(selectElement, u, t)
    },
    appendData = (selector: string, container: HTMLElement, data: InitData) => {
      let uri: string

      if (data.apiKey) {
        uri = `https://tt.teamtailor.com/api/${selector}?company_id=${data.company}`
      } else {
        uri = data.url || `https://api.teamtailor.com/v1/${selector}?`
        uri = addAPIKey(uri, data)

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

      const selectWrapper: HTMLDivElement = createElement(
        'div',
        'teamtailor-jobs__select-wrapper'
      )
      container
        .querySelectorAll('.teamtailor-jobs__filters')[0]
        .appendChild(selectWrapper)

      if (selector === 'remote_statuses') {
        populateDOM(returnTypes, selector, container, selectWrapper, data)
      } else {
        handleFallback(
          uri,
          (n: ReturnType) => {
            if ((n.items && n.items.length) || (n.data && n.data.length)) {
              populateDOM(n, selector, container, selectWrapper, data)
            }
          },
          data
        )
      }
    },
    appendChildren = () => {
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
  return {
    init: function (data: InitData) {
      if (!data.apiKey && !data.company) {
        throw new Error('Missing API Key')
      }
      apiRequest(prepareRequest(data), (t) => {
        const widget =
            data.jobsWidget ||
            document.getElementById('teamtailor-jobs-widget'),
          jobWrapper = createElement('div', 'teamtailor-jobs__job-wrapper')
        widget.appendChild(jobWrapper)

        const { texts } = t.meta,
          { length } = returnTypes

        for (let i = 0; i < length; ++i) {
          const { value } = returnTypes[i]
          if (value in texts) {
            returnTypes[i].name = texts[value as keyof typeof texts]
          }
        }
        if (
          (addToWrapper(widget, t, data),
          ((data.companySelect ||
            data.departmentSelect ||
            data.locationSelect ||
            data.languageSelect ||
            data.regionSelect) &&
            (!data.preselectedDepartment || !data.preselectedLocation)) ||
            data.remoteStatusSelect ||
            data.roleSelect)
        ) {
          const filters: HTMLDivElement = createElement(
            'div',
            'teamtailor-jobs__filters'
          )
          widget.insertBefore(filters, jobWrapper)

          if (data.companySelect) {
            appendData('companies', widget, data)
          }

          if (data.departmentSelect && !data.preselectedDepartment) {
            appendData('departments', widget, data)
          }

          if (data.roleSelect) {
            appendData('roles', widget, data)
          }

          if (data.regionSelect) {
            appendData('regions', widget, data)
          }

          if (data.locationSelect && !data.preselectedLocation) {
            appendData('locations', widget, data)
          }

          if (data.languageSelect && !data.preselectedLanguage) {
            appendData('career-sites', widget, data)
          }

          if (data.remoteStatusSelect) {
            appendData('remote_statuses', widget, data)
          }
        }
      })
    },
    run: function () {
      if (
        !('TEAMTAILOR_JOB_SCRIPT_LOADED' in window) ||
        !window.TEAMTAILOR_JOB_SCRIPT_LOADED
      ) {
        ;(window as any).TEAMTAILOR_JOB_SCRIPT_LOADED = true

        appendChildren()

        const jobsWidgets: HTMLDivElement[] = Array.from(
            document.querySelectorAll('.teamtailor-jobs-widget')
          ),
          { length } = jobsWidgets
        for (let i = 0; i < length; ++i) {
          Teamtailor.init({
            apiKey: jobsWidgets[i].getAttribute('data-teamtailor-api-key'),
            company: jobsWidgets[i].getAttribute('data-teamtailor-company'),
            companySelect: jobsWidgets[i].getAttribute(
              'data-teamtailor-group-company-select'
            ),
            departmentSelect: jobsWidgets[i].getAttribute(
              'data-teamtailor-department-select'
            ),
            feed:
              jobsWidgets[i].getAttribute('data-teamtailor-feed') || 'public',
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
            pagination: jobsWidgets[i].getAttribute(
              'data-teamtailor-pagination'
            ),
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
    },
  }
})()

export default Teamtailor
