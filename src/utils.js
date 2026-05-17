export function actionExample(action) {
  return {
    entity_id: "light.kitchen",
    service: action.service,
    service_data: action.example_data || {},
    alias: `Run ${action.service} for light.kitchen`,
  };
}

export function formatFieldCount(fields = {}) {
  const count = Object.keys(fields || {}).length;
  return `${count} field${count === 1 ? "" : "s"}`;
}
