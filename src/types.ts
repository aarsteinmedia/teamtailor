export interface InitData {
  apiKey: null | string
  'career-sites'?: string
  companies?: string
  company: null | string
  companySelect: null | string
  departments?: string
  departmentSelect: null | string
  feed: string
  jobsWidget: HTMLDivElement | null
  languageSelect: string | null
  limit: number | null
  locations?: string
  locationSelect: string | null
  locationsExclude: null | string[]
  pagination: string | null
  popup: string | null
  preselectedDepartment: string | null
  preselectedLanguage: string | null
  preselectedLocation: string | null
  regions?: string
  regionSelect: string | null
  remote_statuses?: string
  remoteStatusSelect: string | null
  roles?: string
  roleSelect: string | null
  url?: string
}

export interface Locations {[id: string]: Location}

export interface Departments {[id: string]: Department}

export interface Roles {[id: string]: Role}

export interface Regions {[id: string]: Region}

interface Unit {
  attributes: {
    name: string
    city: string
  }
  id: string
  links: { self: string }
}

export interface Region extends Unit {type: 'regions'}

export interface Department extends Unit {type: 'departments'}

export interface Location extends Unit {type: 'locations'}

export interface Role extends Unit {type: 'roles'}

export interface ReturnType {
  data?: unknown[]
  items?: unknown[]
  name?: string
  value: string
}

export interface JobData {
  attributes?: {
    'company-name'?: string
    city?: string
    name?: string
    'apply-button-text': string
    body: string
    'end-date': string | null
    'human-status': string
    internal: boolean
    'language-code': string
    picture: {
      original: string
      standard: string
      thumb: string
    }
    pinned: boolean
    'start-date': null
    status: 'open'
    tags: []
    title: string
    'internal-name': string
    pitch: string
    'external-application-url': string | null
    'name-requirement': string
    'resume-requirement': string
    'additional-files-requirement': string
    'cover-letter-requirement': string
    'phone-requirement': string
    'created-at': string | null
    'updated-at': string | null
    'sharing-image-layout': string
    'remote-status': string
    currency: string
    'template-name': null | string
    'recruiter-email': string
  }
  department_name?: string
  id: string
  links: {
    'careersite-job-url': string
    'careersite-job-apply-url': string
    'careersite-job-apply-iframe-url': string
    'careersite-job-internal-url': string
    self: string
  }
  location_name?: string
  name?: string
  relationships?: {
    activities: {
      links: {
        self: string
        related: string
      }
    }
    department: {
      links: {
        self: string
        related: string
      }
      data: {
        type: string
        id: string
      }
    }
    role: {
      links: {
        self: string
        related: string
      }
      data: null | Role
    }
    location: {
      links: {
        self: string
        related: string
      }
    }
    locations: {
      links: {
        self: string
        related: string
      }
      data: Location[]
    }
    regions: {
      links: {
        self: string
        related: string
      }
      data: Region[]
    }
    user: {
      links: {
        self: string
        related: string
      }
    }
    questions: {
      links: {
        self: string
        related: string
      }
    }
    candidates: {
      links: {
        self: string
        related: string
      }
    }
    stages: {
      links: {
        self: string
        related: string
      }
    }
    colleagues: {
      links: {
        self: string
        related: string
      }
    }
    'team-memberships': {
      links: {
        self: string
        related: string
      }
    }
    'picked-questions': {
      links: {
        self: string
        related: string
      }
    }
    requisition: {
      links: {
        self: string
        related: string
      }
    }
    'custom-fields': {
      links: {
        self: string
        related: string
      }
    }
    'custom-field-values': {
      links: {
        self: string
        related: string
      }
    }
    team: {
      links: {
        self: string
        related: string
      }
    }
  }
  title?: string
  type: 'jobs'
}

export interface Texts {
  [key: string]: string
  // 'all-remote-statuses': string
  // fully?: string
  // hybrid?: string
  // next?: string
  // none?: string
  // prev?: string
  // temporary?: string
}

export interface APIResponse {
  data: JobData[]
  included: (Region | Department | Location | Role)[]
  items?: JobData[]
  jobs?: JobData[]
  links: {
    first: string
    last: string
    next: string
    prev: string
  }
  meta: {
    texts: Texts
    'record-count': number
    'page-count': number
  }
  text?: Texts
}
