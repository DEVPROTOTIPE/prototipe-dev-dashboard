/**
 * provisioningPayload.js
 * 
 * Adaptador de salida para el Dashboard. Normaliza el payload del wizard
 * a la estructura de contrato canonica (blueprint + execution + root params).
 */

/**
 * Clasifica una lista plana de recomendaciones en features, components y patterns.
 * @param {Array} recommendations Lista plana de strings
 * @returns {Object} Arrays clasificados
 */
export function mapRecommendationsToBlueprint(recommendations) {
  const features = [];
  const components = [];
  const patterns = [];

  if (!Array.isArray(recommendations)) {
    return { features, components, patterns };
  }

  const featureSet = new Set(['sales', 'inventory', 'billing', 'crm', 'orders', 'appointments', 'patients']);
  const componentSet = new Set(['OrderCard', 'CajaDiariaPos', 'CajaPos', 'PremiumCalendar']);
  const patternSet = new Set([
    'pattern-calendar-workspace', 'pattern-dashboard-workspace',
    'pattern-kanban-workspace', 'pattern-search-details', 'pattern-wizard-flow'
  ]);

  for (const item of recommendations) {
    if (featureSet.has(item)) {
      features.push(item);
    } else if (componentSet.has(item)) {
      components.push(item);
    } else if (patternSet.has(item)) {
      patterns.push(item);
    }
  }

  return { features, components, patterns };
}

/**
 * Construye el payload normalizado a partir de los datos de entrada del wizard.
 * @param {Object} body Payload plano del wizard o mixto
 * @returns {Object} Envelope canonico
 */
export function buildProvisioningPayload(body) {
  if (!body || typeof body !== 'object') {
    throw new Error('El payload del wizard no es un objeto valido.');
  }

  const isNested = !!(body.blueprint && typeof body.blueprint === 'object');

  if (isNested) {
    const { blueprint, execution, ...rest } = body;
    return {
      blueprint: blueprint ? { ...blueprint } : {},
      execution: execution ? { ...execution } : {},
      ...rest
    };
  }

  const allowedBlueprintKeys = new Set([
    'blueprintVersion', 'instanceId', 'clientName', 'coreType', 'vertical',
    'branding', 'features', 'components', 'patterns'
  ]);

  const allowedExecutionKeys = new Set([
    'targetPath', 'force', 'enableGithub', 'firebaseDeploy', 'centralRegistration'
  ]);

  const blueprint = {
    blueprintVersion: body.version || body.blueprintVersion || '1.0.0',
    instanceId: body.clientId || body.instanceId,
    clientName: body.projectName || body.clientName,
    coreType: body.template || body.coreType,
    vertical: body.niche || body.vertical,
    branding: {
      paletteChoice: body.paletteChoice || body.branding?.paletteChoice
    }
  };

  // Mapear branding extendido si existe
  if (body.branding && typeof body.branding === 'object') {
    blueprint.branding = {
      ...blueprint.branding,
      ...body.branding
    };
    if (body.paletteChoice !== undefined) {
      blueprint.branding.paletteChoice = body.paletteChoice;
    }
  }

  // Clasificar recomendaciones
  const recList = body.selectedRecomendations || body.selectedRecommendations || [];
  const { features, components, patterns } = mapRecommendationsToBlueprint(recList);
  blueprint.features = features;
  blueprint.components = components;
  blueprint.patterns = patterns;

  // Extraer execution
  const execution = {
    targetPath: body.targetPath,
    force: body.force !== undefined ? !!body.force : false,
    enableGithub: body.enableGithub !== undefined ? !!body.enableGithub : (body.flags?.enableGithub !== undefined ? !!body.flags.enableGithub : false),
    firebaseDeploy: body.enableFirebaseDeploy !== undefined ? !!body.enableFirebaseDeploy : (body.flags?.enableFirebaseDeploy !== undefined ? !!body.flags.enableFirebaseDeploy : false),
    centralRegistration: body.centralRegistration !== undefined ? !!body.centralRegistration : true
  };

  // El resto de parametros de infraestructura (permanecen fuera del blueprint)
  const rest = {};
  for (const key of Object.keys(body)) {
    const isBlueprintKey = allowedBlueprintKeys.has(key) || key === 'clientId' || key === 'projectName' || key === 'version' || key === 'niche' || key === 'paletteChoice' || key === 'template';
    const isExecutionKey = allowedExecutionKeys.has(key) || key === 'enableFirebaseDeploy';
    if (!isBlueprintKey && !isExecutionKey) {
      rest[key] = body[key];
    }
  }

  return {
    blueprint,
    execution,
    ...rest
  };
}
