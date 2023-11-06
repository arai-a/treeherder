import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { notify } from '../../redux/stores/notifications';

class LocalRunTab extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { selectedJobFull } = this.props;

    // This variable should be retrieved from the job's data, ultimately from job's YAML file.
    const localRun = `
# local-run field from yml file is supposed to be shown here.
$ ./mach build
$ ./mach awsy-test
`;

    return (
      <div
        role="region"
        aria-label="Local run"
      >
          <pre>
{localRun}
          </pre>
      </div>
    );
  }
}

LocalRunTab.propTypes = {
  selectedJobFull: PropTypes.shape({}).isRequired,
};

export default connect(null, { notify })(LocalRunTab);
