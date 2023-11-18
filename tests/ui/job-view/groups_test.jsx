import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { createBrowserHistory } from 'history';

import { JobGroupComponent } from '../../../ui/job-view/pushes/JobGroup';
import FilterModel from '../../../ui/models/filter';
import mappedGroupFixture from '../mock/mappedGroup';
import mappedGroupDupsFixture from '../mock/mappedGroupDups';
import mappedGroupIntermittentFixture from '../mock/mappedGroupIntermittent';
import { addAggregateFields } from '../../../ui/helpers/job';

const history = createBrowserHistory();

describe('JobGroup component', () => {
  let countGroup;
  let dupGroup;
  let intermittentGroup;
  const repoName = 'autoland';
  const filterModel = new FilterModel({
    pushRoute: history.push,
    router: { location: history.location },
  });
  const pushGroupState = 'collapsed';

  afterEach(() => history.push('/'));

  beforeAll(() => {
    mappedGroupFixture.jobs.forEach((job) => addAggregateFields(job));
    mappedGroupDupsFixture.jobs.forEach((job) => addAggregateFields(job));
    mappedGroupIntermittentFixture.jobs.forEach((job) =>
      addAggregateFields(job),
    );
  });

  beforeEach(() => {
    countGroup = cloneDeep(mappedGroupFixture);
    dupGroup = cloneDeep(mappedGroupDupsFixture);
    intermittentGroup = cloneDeep(mappedGroupIntermittentFixture);
  });

  const jobGroup = (
    group,
    groupCountsExpanded = false,
    duplicateJobsVisible = false,
    intermittentFailureJobsVisible = true,
  ) => (
    <JobGroupComponent
      repoName={repoName}
      group={group}
      filterPlatformCb={() => {}}
      filterModel={filterModel}
      pushGroupState={pushGroupState}
      platform={<span>windows</span>}
      duplicateJobsVisible={duplicateJobsVisible}
      intermittentFailureJobsVisible={intermittentFailureJobsVisible}
      groupCountsExpanded={groupCountsExpanded}
      push={history.push}
    />
  );

  /*
      Tests Jobs view
   */
  it('collapsed should show a job and count of 2 icon when collapsed', async () => {
    const { getByTestId } = render(jobGroup(countGroup));

    const jobGroupCount = await waitFor(() => getByTestId('job-group-count'));
    expect(jobGroupCount).toHaveTextContent('2');
  });

  test('should show a job and count of 2 icon when re-collapsed', async () => {
    const { getByText, getByTestId } = render(jobGroup(countGroup));

    const jobGroupCount = await waitFor(() => getByTestId('job-group-count'));
    expect(jobGroupCount).toHaveTextContent('2');

    fireEvent.click(jobGroupCount);

    expect(jobGroupCount).not.toBeInTheDocument();

    const groupSymbolButton = await waitFor(() => getByText('W-e10s'));

    fireEvent.click(groupSymbolButton);
    await waitFor(() => getByTestId('job-group-count'));
  });

  test('should show jobs, not counts when expanded', async () => {
    const { getByTestId, getAllByTestId } = render(jobGroup(countGroup));

    const jobGroupCount = await waitFor(() => getByTestId('job-group-count'));
    expect(jobGroupCount).toHaveTextContent('2');

    fireEvent.click(jobGroupCount);

    expect(jobGroupCount).not.toBeInTheDocument();

    const expandedJobs = await waitFor(() => getAllByTestId('job-btn'));
    expect(expandedJobs).toHaveLength(3);
  });

  test('should show jobs, not counts when globally expanded', async () => {
    const groupCountsExpanded = true;
    const { queryByTestId, getAllByTestId } = render(
      jobGroup(countGroup, groupCountsExpanded),
    );

    const expandedJobs = await waitFor(() => getAllByTestId('job-btn'));
    expect(expandedJobs).toHaveLength(3);

    const jobGroupCount = await waitFor(() => queryByTestId('job-group-count'));
    expect(jobGroupCount).toBeNull();
  });

  test('should hide duplicates by default', async () => {
    const { getAllByTestId } = render(jobGroup(dupGroup));

    const jobGroupCount = await waitFor(() =>
      getAllByTestId('job-group-count'),
    );
    expect(jobGroupCount).toHaveLength(1);

    const expandedJobs = await waitFor(() => getAllByTestId('job-btn'));
    expect(expandedJobs).toHaveLength(1);
  });

  test('should show 2 duplicates when set to show duplicates', async () => {
    // determined by the presence of duplicate_jobs=visible query param
    // parsed in the job-view App
    const duplicateJobsVisible = true;
    const groupCountsExpanded = false;

    const { getAllByTestId } = render(
      jobGroup(dupGroup, groupCountsExpanded, duplicateJobsVisible),
    );

    const jobGroupCount = await waitFor(() =>
      getAllByTestId('job-group-count'),
    );
    expect(jobGroupCount).toHaveLength(1);

    const jobs = await waitFor(() => getAllByTestId('job-btn'));
    expect(jobs).toHaveLength(2);
  });

  test('should show 4 jobs when set to show intermittent failure jobs', async () => {
    const duplicateJobsVisible = false;
    const groupCountsExpanded = true;
    const intermittentFailureJobsVisible = true;

    const { getAllByTestId } = render(
      jobGroup(
        intermittentGroup,
        groupCountsExpanded,
        duplicateJobsVisible,
        intermittentFailureJobsVisible,
      ),
    );

    const jobs = await waitFor(() => getAllByTestId('job-btn'));
    expect(jobs).toHaveLength(4);

    expect(jobs[0].firstChild.textContent).toBe('asan');
    expect(jobs[0].querySelectorAll('.fa-mitten')).toHaveLength(0);

    expect(jobs[1].firstChild.textContent).toBe('msan');
    expect(jobs[1].querySelectorAll('.fa-mitten')).toHaveLength(0);

    expect(jobs[2].firstChild.textContent).toBe('msan');
    expect(jobs[2].querySelectorAll('.fa-mitten')).toHaveLength(1);

    expect(jobs[3].firstChild.textContent).toBe('p');
    expect(jobs[3].querySelectorAll('.fa-mitten')).toHaveLength(0);
  });

  test('should show 3 jobs when set to hide intermittent failure jobs', async () => {
    const duplicateJobsVisible = false;
    const groupCountsExpanded = true;
    const intermittentFailureJobsVisible = false;

    const { getAllByTestId } = render(
      jobGroup(
        intermittentGroup,
        groupCountsExpanded,
        duplicateJobsVisible,
        intermittentFailureJobsVisible,
      ),
    );

    const jobs = await waitFor(() => getAllByTestId('job-btn'));
    expect(jobs).toHaveLength(3);

    expect(jobs[0].firstChild.textContent).toBe('asan');
    expect(jobs[0].querySelectorAll('.fa-mitten')).toHaveLength(0);

    expect(jobs[1].firstChild.textContent).toBe('msan');
    expect(jobs[1].querySelectorAll('.fa-mitten')).toHaveLength(0);

    expect(jobs[2].firstChild.textContent).toBe('p');
    expect(jobs[2].querySelectorAll('.fa-mitten')).toHaveLength(0);
  });
});
