export const formatAmount = (amount) => `Rs ${Math.abs(Number(amount || 0))}`;

export const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleDateString();
};

export const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString();
};

export const todayString = () => new Date().toISOString().split("T")[0];
