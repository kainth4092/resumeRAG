import Select from "../../resume/components/resume/dashboard/Select";
import {
  LOCATION_OPTS,
  JOB_TYPE_OPTS,
  REMOTE_OPTS,
} from "../constants/jobs.constants";

export default function FilterBar({
  location,
  setLocation,
  jobType,
  setJobType,
  remote,
  setRemote,
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Select
        options={LOCATION_OPTS}
        value={location}
        onChange={setLocation}
        placeholder="Location"
        size="sm"
      />

      <Select
        options={JOB_TYPE_OPTS}
        value={jobType}
        onChange={setJobType}
        placeholder="Job Type"
        size="sm"
      />
      <Select
        options={REMOTE_OPTS}
        value={remote}
        onChange={setRemote}
        placeholder="Remote/Onsite"
        size="sm"
      />
    </div>
  );
}
