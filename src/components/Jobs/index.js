import {Component} from 'react'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'

import FiltersGroup from '../FiltersGroup'
import JobsHeader from '../JobsHeader'
import Header from '../Header'
import JobItem from '../JobItem'
import Profile from '../Profile'

import './index.css'

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    jobsList: [],
    apiStatus: apiStatusConstants.initial,
    activeEmploymentTypeIds: [],
    searchInput: '',
    activeSalaryRangeId: '',
  }

  componentDidMount() {
    this.getJobs()
  }

  getJobs = async () => {
    const {
      activeEmploymentTypeIds,
      activeSalaryRangeId,
      searchInput,
    } = this.state
    const employmentType = activeEmploymentTypeIds.join(',')
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')
    const jobsApiUrl = `https://apis.ccbp.in/jobs?employment_type=${employmentType}&minimum_package=${activeSalaryRangeId}&search=${searchInput}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(jobsApiUrl, options)
    if (response.ok) {
      const fetchedData = await response.json()
      const updatedData = fetchedData.jobs.map(job => ({
        title: job.title,
        companyLogoUrl: job.company_logo_url,
        employmentType: job.employment_type,
        jobDescription: job.job_description,
        id: job.id,
        location: job.location,
        packagePerAnnum: job.package_per_annum,
        rating: job.rating,
      }))
      this.setState({
        jobsList: updatedData,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  changeSalaryRange = activeSalaryRangeId => {
    this.setState({activeSalaryRangeId}, this.getJobs)
  }

  changeEmploymentType = (checked, employmentTypeId) => {
    if (checked) {
      this.setState(
        prevState => ({
          activeEmploymentTypeIds: [
            ...prevState.activeEmploymentTypeIds,
            employmentTypeId,
          ],
        }),
        this.getJobs,
      )
    } else {
      this.setState(
        prevState => ({
          activeEmploymentTypeIds: prevState.activeEmploymentTypeIds.filter(
            eachEmploymentTypeId => eachEmploymentTypeId !== employmentTypeId,
          ),
        }),
        this.getJobs,
      )
    }
  }

  enterSearchInput = () => {
    this.getJobs()
  }

  changeSearchInput = searchInput => {
    this.setState({searchInput})
  }

  renderLoadingView = () => (
    <div className="loader-container" testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderFailureView = () => (
    <div className="failure-view-container">
      <img
        alt="failure view"
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        className="failure-view-img"
      />
      <h1 className="failure-view-heading">Oops! Something Went Wrong</h1>
      <p className="failure-view-description">
        We cannot seem to find the page you are looking for.
      </p>
      <button type="button" className="retry-button" onClick={this.getJobs}>
        Retry
      </button>
    </div>
  )

  renderNoJobsView = () => (
    <div className="jobs-not-found-container">
      <img
        alt="no jobs"
        src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
        className="jobs-not-found-img"
      />
      <h1 className="jobs-not-found-heading">No Jobs Found</h1>
      <p className="jobs-not-found-description">
        We could not find any jobs. Try other filters.
      </p>
    </div>
  )

  renderJobsList = () => {
    const {jobsList} = this.state

    return jobsList.length === 0 ? (
      this.renderNoJobsView()
    ) : (
      <ul className="jobs-list">
        {jobsList.map(job => (
          <JobItem jobData={job} key={job.id} />
        ))}
      </ul>
    )
  }

  renderJobs = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderJobsList()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  render() {
    const {searchInput} = this.state

    return (
      <div className="jobs-container">
        <Header />
        <div className="jobs">
          <div className="jobs-responsive-container">
            <div className="search-bar-mobile">
              <JobsHeader
                enterSearchInput={this.enterSearchInput}
                changeSearchInput={this.changeSearchInput}
                searchInput={searchInput}
              />
            </div>
            <div className="profile-and-filters-container">
              <Profile />
              <hr className="horizontal-line" />
              <FiltersGroup
                employmentTypesList={employmentTypesList}
                salaryRangesList={salaryRangesList}
                changeEmploymentType={this.changeEmploymentType}
                changeSalaryRange={this.changeSalaryRange}
              />
            </div>
            <div className="jobs-list-container">
              <div className="desktop-search-bar">
                <JobsHeader
                  enterSearchInput={this.enterSearchInput}
                  changeSearchInput={this.changeSearchInput}
                  searchInput={searchInput}
                />
              </div>
              {this.renderJobs()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Jobs
