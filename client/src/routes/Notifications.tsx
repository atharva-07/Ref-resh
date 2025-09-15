import { useMutation } from "@apollo/client";
import { useEffect } from "react";

import { SET_READ_NOTIFICATIONS_AT } from "@/gql-calls/mutation";

const NOTIFICATIONS: string[] = [
  "Clown Ass Nigga liked your post.",
  "Bitch Ass Nigga finally found food in Africa.",
];

const Notifications = () => {
  const [setReadNotificationsAt, { data, error, loading }] = useMutation(
    SET_READ_NOTIFICATIONS_AT
  );

  useEffect(() => {
    setReadNotificationsAt();
  }, [setReadNotificationsAt]);

  return (
    <>
      {error && <p>Could not update the Timestamp.</p>}
      {loading && <p>Updating Timestamp....</p>}
      {data && (
        <p>
          Timestamp saved successfully to db:&nbsp;
          {new Date(parseInt(data.setReadNotificationsAt)).toLocaleString()}
        </p>
      )}
      <div>
        {NOTIFICATIONS.map((element, idx) => (
          <h3 key={idx} className="m-4 p-4 border border-emerlad-400">
            {element}
          </h3>
        ))}
      </div>
    </>
  );
};

export default Notifications;
