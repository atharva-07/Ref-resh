import { useParams } from "react-router-dom";

const Profile = () => {
  const params = useParams();

  return <h4>You are visitng the profile page of user: {params.username}</h4>;
};

export default Profile;
