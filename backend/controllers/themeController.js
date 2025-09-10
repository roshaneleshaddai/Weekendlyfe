const getThemes = (req, res) => {
  const themes = [
    { id: "lazy", name: "Lazy Weekend", color: "#F3E8FF", icon: "😴" },
    { id: "adventurous", name: "Adventurous", color: "#FEF3C7", icon: "🏔️" },
    { id: "family", name: "Family Time", color: "#D1FAE5", icon: "👨‍👩‍👧‍👦" },
    { id: "romantic", name: "Romantic", color: "#FAD9E8", icon: "💕" },
    { id: "productive", name: "Productive", color: "#DBEAFE", icon: "⚡" },
    { id: "social", name: "Social", color: "#FDE68A", icon: "🎉" },
  ];
  res.json(themes);
};

const getVibes = (req, res) => {
  const vibes = [
    { id: "happy", name: "Happy", emoji: "😊", color: "#FEF3C7" },
    { id: "relaxed", name: "Relaxed", emoji: "😌", color: "#D1FAE5" },
    { id: "energetic", name: "Energetic", emoji: "⚡", color: "#FDE68A" },
    { id: "focused", name: "Focused", emoji: "🎯", color: "#DBEAFE" },
    { id: "creative", name: "Creative", emoji: "🎨", color: "#FAD9E8" },
    { id: "adventurous", name: "Adventurous", emoji: "🏔️", color: "#F3E8FF" },
  ];
  res.json(vibes);
};

module.exports = {
  getThemes,
  getVibes,
};
