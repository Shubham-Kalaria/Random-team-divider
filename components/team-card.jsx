import { getCategoryIcon } from "@/lib/utils";

const TeamCard = ({ name, category }) => {
  return (
    <div className="team-card">
      <h3>{name}</h3>
      <p>
        {getCategoryIcon(category)} {category}
      </p>
    </div>
  );
};

export default TeamCard;
