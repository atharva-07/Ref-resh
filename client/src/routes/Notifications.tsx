const NOTIFICATIONS: string[] = [
  "Clown Ass Nigga liked your post.",
  "Bitch Ass Nigga finally found food in Africa.",
];

const Notifications = () => {
  return (
    <div>
      {NOTIFICATIONS.map((element) => (
        <h3 className="m-4 p-4 border border-emerlad-400">{element}</h3>
      ))}
    </div>
  );
};

export default Notifications;
