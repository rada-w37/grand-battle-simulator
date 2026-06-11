export function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

export function createScoreCell(value, className = "") {
  const cell = document.createElement("td");
  cell.textContent = String(value);
  if (className) cell.className = className;
  return cell;
}

export function setDevLayoutMetadata(element, {
  targetId,
  layoutKey,
  pointId,
  role = "",
  targetType = ""
}) {
  element.dataset.devLayoutId = targetId;
  element.dataset.devLayoutKey = layoutKey;
  element.dataset.devLayoutPointId = pointId;
  element.dataset.devLayoutTargetType = targetType || role || layoutKey;
  if (role) {
    element.dataset.devLayoutRole = role;
  }
}
