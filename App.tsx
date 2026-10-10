import {
  Bell,
  Bot,
  ChevronRight,
  CloudRain,
  Droplets,
  Leaf,
  Map,
  Menu,
  Settings,
  Sprout,
  ThermometerSun,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { useState, useEffect } from "react";
import { getFarmWeather, type FarmWeather } from "./weatherService";
import FarmMap from "./FarmMap";
import "./App.css";
import { getIrrigationDecision } from "./irrigationService";
import MarketIntelligence from "./MarketIntelligence";
import FarmTeam from "./FarmTeam";

function FieldsPage({
  onViewField,
}: {
  onViewField: (
    fieldName: string,
    latitude: number,
    longitude: number
  ) => void;
}) {

  const fields = [
    {
      name: "North Plot",
      crop: "Maize",
      area: "4.8 ha",
      health: "Good",
      moisture: "Low",
      status: "Attention",
      position: [-1.2921, 36.8219] as [number, number],
    },
    {
      name: "East Plot",
      crop: "Beans",
      area: "3.2 ha",
      health: "Fair",
      moisture: "Moderate",
      status: "Monitor",
      position: [-1.2932, 36.8241] as [number, number],
    },
    {
      name: "South Field",
      crop: "Maize",
      area: "6.5 ha",
      health: "Excellent",
      moisture: "Good",
      status: "Healthy",
      position: [-1.2951, 36.8228] as [number, number],
    },
    {
      name: "West Field",
      crop: "Vegetables",
      area: "2.7 ha",
      health: "Good",
      moisture: "Good",
      status: "Healthy",
      position: [-1.2938, 36.8192] as [number, number],
    },
  ];

  return (
    <div className="fields-page">
      <header className="page-header">
        <div>
          <p className="section-label">YOUR FARM</p>
          <h2>My fields</h2>
          <p>
            Monitor your fields, crop health and current growing conditions.
          </p>
        </div>

        <button className="primary-button add-field-button" type="button">
          + Add field
        </button>
      </header>

      <section className="field-summary">
        <div>
          <span>Total fields</span>
          <strong>8</strong>
        </div>

        <div>
          <span>Total area</span>
          <strong>24.6 ha</strong>
        </div>

        <div>
          <span>Healthy fields</span>
          <strong>6</strong>
        </div>

        <div>
          <span>Need attention</span>
          <strong>2</strong>
        </div>
      </section>

      <section className="fields-section">
        <div className="section-heading">
          <div>
            <p className="section-label">FIELD MONITORING</p>
            <h3>Your fields</h3>
          </div>

          <span className="insight-count">Updated recently</span>
        </div>

        <div className="fields-grid">
          {fields.map((field) => (
            <article className="field-card" key={field.name}>
              <div className="field-map">
                <div className="field-map-shape shape-a" />
                <div className="field-map-shape shape-b" />

                <div className="field-map-marker">
                  <Leaf size={15} />
                </div>
              </div>

              <div className="field-card-body">
                <div className="field-card-heading">
                  <div>
                    <h4>{field.name}</h4>
                    <span>{field.crop}</span>
                  </div>

                  <span
                    className={`field-status ${
                      field.status === "Attention"
                        ? "field-status-danger"
                        : field.status === "Monitor"
                        ? "field-status-warning"
                        : "field-status-success"
                    }`}
                  >
                    {field.status}
                  </span>
                </div>

                <div className="field-data">
                  <div>
                    <span>Area</span>
                    <strong>{field.area}</strong>
                  </div>

                  <div>
                    <span>Crop health</span>
                    <strong>{field.health}</strong>
                  </div>

                  <div>
                    <span>Soil moisture</span>
                    <strong>{field.moisture}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="field-view-button"
                  
                    onClick={() =>
                       onViewField(
                        field.name,
                        field.position[0],
                       field.position[1]
              )
            }
                >
                  View field
                  <ChevronRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}


function FieldDetailPage({
  fieldName,
  onBack,
  weather,
}: {
  fieldName: string;
  onBack: () => void;
  weather: FarmWeather | null;
}) {

  const fieldData: Record<
    string,
    {
      crop: string;
      area: string;
      health: string;
      moisture: string;
      status: string;
    }
  > = {
    "North Plot": {
      crop: "Maize",
      area: "4.8 ha",
      health: "Good",
      moisture: "Low",
      status: "Attention",
    },
    "East Plot": {
      crop: "Beans",
      area: "3.2 ha",
      health: "Fair",
      moisture: "Moderate",
      status: "Monitor",
    },
    "South Field": {
      crop: "Maize",
      area: "6.5 ha",
      health: "Excellent",
      moisture: "Good",
      status: "Healthy",
    },
    "West Field": {
      crop: "Vegetables",
      area: "2.7 ha",
      health: "Good",
      moisture: "Good",
      status: "Healthy",
    },
  };

  const field = fieldData[fieldName] ?? fieldData["North Plot"];

  const needsWater = field.moisture === "Low";

  return (
    <div className="field-detail-page">
      <button type="button" className="back-button" onClick={onBack}>
        ← Back to My Fields
      </button>

      <div className="field-detail-header">
        <div>
          <p className="section-label">FIELD INTELLIGENCE</p>

          <h2>{fieldName}</h2>

          <p className="field-subtitle">
            {field.crop} · {field.area}
          </p>
        </div>

        <span
          className={`large-field-status ${
            field.status === "Attention"
              ? "field-status-danger"
              : field.status === "Monitor"
              ? "field-status-warning"
              : "field-status-success"
          }`}
        >
          {field.status}
        </span>
      </div>

      <section className="field-detail-grid">
        <div className="field-detail-map">
          <div className="detail-map-grid" />

          <div className="detail-field-shape detail-shape-one" />
          <div className="detail-field-shape detail-shape-two" />

          <div className="detail-map-marker">
            <Leaf size={18} />
          </div>

          <div className="map-label">
            <span>LIVE FIELD VIEW</span>
            <strong>{fieldName}</strong>
          </div>
        </div>

        <div className="field-metrics">
          <div className="metric-card">
            <div className="metric-icon green">
              <Leaf size={19} />
            </div>

            <span>Crop health</span>
            <strong>{field.health}</strong>
          </div>

          <div className="metric-card">
            <div className="metric-icon blue">
              <Droplets size={19} />
            </div>

            <span>Soil moisture</span>
            <strong>{field.moisture}</strong>
          </div>

          <div className="metric-card">
            <div className="metric-icon orange">
              <ThermometerSun size={19} />
            </div>

            <span>Temperature</span>
            <strong>
            {weather ? `${weather.temperature}°C` : "Loading..."}
          </strong>
          </div>

          <div className="metric-card">
            <div className="metric-icon purple">
              <CloudRain size={19} />
            </div>

            <span>Rain outlook</span>
           
<strong>
  {weather
    ? `${weather.rainProbability}% chance`
    : "Loading..."}
</strong>
          </div>
        </div>
      </section>

      <section className="ai-assessment">
        <div className="ai-assessment-icon">
          <Bot size={24} />
        </div>

        <div className="ai-assessment-content">
          <span className="agent-label">AI FARM AGENT</span>

          <h3>Field assessment</h3>

          <p>
            {needsWater
              ? `${fieldName} is showing signs of water stress. Soil moisture is below the preferred range and the current rainfall outlook is low.`
              : `${fieldName} is currently within a healthy operating range. Crop conditions and soil moisture should continue to be monitored.`}
          </p>
        </div>
      </section>

      <section className="recommendation-panel">
        <div className="recommendation-heading">
          <div>
            <p className="section-label">AI RECOMMENDATION</p>
            <h3>Recommended action</h3>
          </div>

          <span
            className={`status-pill ${needsWater ? "danger" : "success"}`}
          >
            {needsWater ? "ACTION NEEDED" : "NO URGENT ACTION"}
          </span>
        </div>

        <div className="recommendation-content">
          <div className="recommendation-number">01</div>

          <div>
            <h4>
              {needsWater
                ? "Irrigate the field within the next 24 hours"
                : "Continue current field management"}
            </h4>

            <p>
              {needsWater
                ? "Prioritise irrigation for this field and review soil moisture again after watering."
                : "Current conditions do not indicate an urgent intervention. Continue monitoring crop development and soil conditions."}
            </p>
          </div>
        </div>

        <div className="recommendation-actions">
          <button type="button" className="primary-button">
            {needsWater ? "Plan irrigation" : "Create action plan"}
            <ChevronRight size={17} />
          </button>

          <button type="button" className="secondary-button">
            Ask Farm Agent
          </button>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activePage, setActivePage] = useState("overview");
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [agentField, setAgentField] = useState<string | null>(null);
  const [agentMessage, setAgentMessage] = useState("");
  const [agentResponse, setAgentResponse] = useState("");
  const [weather, setWeather] = useState<FarmWeather | null>(null);
  const [fieldLatitude, setFieldLatitude] = useState(-1.2921);
  const [fieldLongitude, setFieldLongitude] = useState(36.8219);

  

useEffect(() => {
  let cancelled = false;

  async function loadWeather() {
    try {
      const forecast = await getFarmWeather(
        fieldLatitude,
        fieldLongitude
      );

      if (!cancelled) {
        setWeather(forecast);
      }
    } catch {
      if (!cancelled) {
        setWeather(null);
      }
    }
  }

  void loadWeather();

  return () => {
    cancelled = true;
  };
}, [fieldLatitude, fieldLongitude]);

 const handleAgentSuggestion = (
  message: string,
  field?: string
) => {
  setAgentMessage(message);
  setAgentResponse("");

  if (field) {
    setAgentField(field);
  }
};

  const handleAskAgent = () => {
  if (!agentMessage.trim()) return;

  const question = agentMessage.toLowerCase().trim();
  
const fieldNames = [
  "North Plot",
  "East Plot",
  "South Field",
  "West Field",
];

const irrigationQuestion =
  question.includes("irrigate") ||
  question.includes("irrigation") ||
  question.includes("water") ||
  question.includes("watering");

const irrigationField =
  fieldNames.find((name) => question.includes(name.toLowerCase())) ??
  (irrigationQuestion && agentField && fieldNames.includes(agentField)
    ? agentField
    : null);

const irrigationResult =
  irrigationQuestion && irrigationField
    ? getIrrigationDecision(irrigationField, weather)
    : null;

  const fieldContext = agentField
  ? ` The farmer is currently focused on ${agentField}.`
  : "";

  let response =
    `I can help with that. Based on the farm information currently available, I recommend checking your field conditions before taking action.`;
  // IRRIGATION QUESTIONS
  if (irrigationResult) {
  response =
    `${irrigationResult.fieldName}: ${irrigationResult.decision}. ` +
    `${irrigationResult.reason} ` +
    `Simulated soil moisture: ${irrigationResult.moisture}%. ` +
    `Threshold: ${irrigationResult.threshold}%.`;

} else if (
  question.includes("irrigate") ||
  question.includes("irrigation") ||
  question.includes("water") ||
  question.includes("watering")
) {
 
//if (!irrigationResult && (
 // question.includes("irrigate") ||
 // question.includes("irrigation") ||
 // question.includes("water") ||
  //question.includes("watering")
//)) {
    if (
      question.includes("north plot") ||
      question.includes("north field")
    ) {
      response = weather
  ? `North Plot has simulated low soil moisture. The nearest forecast hour shows a ${weather.rainProbability}% chance of rain and ${weather.rainfall} mm of precipitation. Check field conditions before irrigating, and reassess if useful rain arrives.`
  : "North Plot has simulated low soil moisture. Check the field and the latest weather forecast before deciding whether to irrigate.";
      } else if (
      question.includes("when") ||
      question.includes("should i")
    ) {
      response =
        "Based on the current farm conditions, North Plot should be prioritised for irrigation because its soil moisture is low. Before watering, check the soil condition and the latest rainfall forecast.";
    } else if (question.includes("how much")) {
      response =
        "The dashboard does not currently provide enough information to calculate an exact irrigation volume. For now, prioritise fields with low soil moisture and avoid unnecessary watering if meaningful rainfall is expected.";
    } else {
      response =
        "Irrigation should currently focus on fields showing low soil moisture, especially North Plot. Check the latest rainfall outlook before watering so you do not irrigate immediately before significant rain.";
    }

 
  // SOIL / MOISTURE QUESTIONS
} else if (
  question.includes("soil") ||
  question.includes("moisture") ||
  question.includes("dry")
) {
  if (
    question.includes("north plot") ||
    question.includes("north field")
  ) {
    response =
      "North Plot currently has low soil moisture and should be monitored closely. I recommend checking the soil before the next irrigation cycle and reassessing the moisture level after watering.";
  } else if (
    question.includes("east plot") ||
    question.includes("east field")
  ) {
    response =
      "East Plot is currently in a fair condition. Continue monitoring its soil moisture and crop condition so you can respond early if the field begins to dry out.";
  } else if (
    question.includes("south field") ||
    question.includes("south plot")
  ) {
    response =
      "South Field is currently in a healthier condition. There is no immediate moisture concern indicated, but regular monitoring should continue.";
  } else if (
    question.includes("west field") ||
    question.includes("west plot")
  ) {
    response =
      "West Field is currently in a healthier condition. Continue normal monitoring and watch for changes in soil moisture or crop condition.";
  } else {
    response =
      "The main soil-moisture concern on the farm is North Plot. Its moisture level is currently low, so it should be monitored closely and considered for irrigation.";
  }

  // WEATHER QUESTIONS
  
} else if (
  question.includes("weather") ||
  question.includes("rain") ||
  question.includes("rainfall") ||
  question.includes("forecast")
) {
  if (weather) {
    response =
      `The latest forecast for the selected field shows a temperature of ${weather.temperature}°C, a ${weather.rainProbability}% chance of rain, and ${weather.rainfall} mm of forecast precipitation for the nearest forecast hour. Check soil moisture and local conditions before deciding whether to irrigate.`;
  } else {
    response =
      "The weather forecast is not available yet. Please try again shortly.";
  }
  // PEST / DISEASE QUESTIONS
  } else if (
    question.includes("pest") ||
    question.includes("insect") ||
    question.includes("disease") ||
    question.includes("fungus") ||
    question.includes("infection")
  ) {
    response =
      "The current dashboard does not provide enough evidence to identify a specific pest or disease. Inspect affected plants for unusual spots, holes, wilting, discoloration, or insects before choosing a treatment.";

  // MAIZE QUESTIONS
  } else if (
    question.includes("maize") ||
    question.includes("corn") ||
    question.includes("crop")
  ) {
    if (
      question.includes("price") ||
      question.includes("sell") ||
      question.includes("selling") ||
      question.includes("market")
    ) {
      response =
        "Current farm intelligence suggests a potentially favourable maize selling window. Before selling, compare the latest local market prices with your expected harvest timing and production costs.";
    } else if (
      question.includes("grow") ||
      question.includes("plant") ||
      question.includes("planting")
    ) {
      response =
        "For maize, focus first on adequate soil moisture, timely field monitoring, and weather conditions. North Plot currently deserves particular attention because its soil moisture is low.";
    } else {
      response =
        "Your maize should be monitored closely for moisture stress, crop health, and weather conditions. North Plot currently has the highest moisture-related risk.";
    }

  // MARKET QUESTIONS
  } else if (
    question.includes("price") ||
    question.includes("market") ||
    question.includes("sell") ||
    question.includes("selling")
  ) {
    response =
      "Current farm intelligence indicates a potentially favourable selling window. Before making a decision, compare current local prices with your expected harvest timing, transport costs, and production costs.";

  // FARM OVERVIEW QUESTIONS
  } else if (
    question.includes("farm") ||
    question.includes("overview") ||
    question.includes("status") ||
    question.includes("doing")
  ) {
    response =
      "Overall, the farm is in a manageable condition, but North Plot is the main area requiring attention because of low soil moisture. East Plot should be monitored, while South Field and West Field are currently healthier.";

  // FALLBACK
  } else {
    response =
      "I can help analyse your farm conditions, irrigation, soil moisture, weather, crop health, maize, pests, and market decisions. Try asking about a specific field or farm issue so I can give you a more targeted recommendation.";
  }
setAgentResponse(response + fieldContext);

};

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Sprout size={24} />
          </div>

          <div>
            <h1>AgriAgent</h1>
            <span>Africa</span>
          </div>

          <button
            type="button"
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="navigation">
          <button
            type="button"
            className={`nav-item ${
              activePage === "overview" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("overview");
              setMobileMenu(false);
            }}
          >
            <Leaf size={19} />
            <span>Farm Overview</span>
          </button>

          <button
            type="button"
            className={`nav-item ${
              activePage === "fields" || activePage === "field-detail"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActivePage("fields");
              setSelectedField(null);
              setMobileMenu(false);
            }}
          >
            <Map size={19} />
            <span>My Fields</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activePage === "agent" ? "active" : ""}`}
            onClick={() => {
              setActivePage("agent");
              setSelectedField(null);
              setMobileMenu(false);
            }}
          >
            <Bot size={19} />
            <span>Farm Agent</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activePage === "alerts" ? "active" : ""}`}
            onClick={() => {
              setActivePage("alerts");
              setSelectedField(null);
              setMobileMenu(false);
            }}
          >
            <Bell size={19} />
            <span>Alerts</span>
            <span className="nav-badge">3</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activePage === "market" ? "active" : ""}`}
            onClick={() => {
              setActivePage("market");
              setSelectedField(null);
              setMobileMenu(false);
            }}
          >
            <TrendingUp size={19} />
            <span>Market Intelligence</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activePage === "team" ? "active" : ""}`}
            onClick={() => {
              setActivePage("team");
              setSelectedField(null);
              setMobileMenu(false);
            }}
          >
            <Users size={19} />
            <span>Farm Team</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button type="button" className="nav-item">
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <div className="farmer-profile">
            <div className="avatar">TW</div>

            <div>
              <strong>Farmer</strong>
              <span>Farm Manager</span>
            </div>
          </div>
        </div>
      </aside>

      {mobileMenu && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* OVERVIEW */}
        {activePage === "overview" && (
          <>
            <header className="topbar">
              <button
                type="button"
                className="mobile-menu"
                onClick={() => setMobileMenu(true)}
              >
                <Menu size={24} />
              </button>

              <div>
                <p className="eyebrow">FARM INTELLIGENCE</p>
                <h2>Good afternoon 👋🏾</h2>
              </div>

              <div className="topbar-actions">
                <button type="button" className="icon-button">
                  <Bell size={20} />
                  <span className="notification-dot" />
                </button>

                <div className="weather-mini">
                  <CloudRain size={19} />
                  <span>24°C</span>
                </div>
              </div>
            </header>

            <section className="hero-card">
              <div className="hero-content">
                <div className="hero-badge">
                  <span className="pulse-dot" />
                  AI FARM AGENT ACTIVE
                </div>

                <h3>
                  Your farm has
                  <span> 3 things </span>
                  that need attention.
                </h3>

                <p>
                  I've analysed your field data, soil conditions, weather
                  outlook and recent farm activity.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setActivePage("agent");
                    setSelectedField(null);
                  }}
                >
                  Open Farm Agent
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="hero-visual">
  <FarmMap
    
onViewField={(fieldName, latitude, longitude) => {
  setSelectedField(fieldName);
  setFieldLatitude(latitude);
  setFieldLongitude(longitude);
  setActivePage("field-detail");
}}
  />
</div>
            </section>

            <section className="section">
              <div className="section-heading">
                <div>
                  <p className="section-label">YOUR FARM</p>
                  <h3>Farm overview</h3>
                </div>

                <button type="button" className="text-button">
                  View full farm
                  <ChevronRight size={17} />
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon green">
                    <Map size={21} />
                  </div>

                  <div>
                    <span>Total area</span>
                    <strong>24.6 ha</strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Leaf size={21} />
                  </div>

                  <div>
                    <span>Active fields</span>
                    <strong>8</strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">
                    <TrendingUp size={21} />
                  </div>

                  <div>
                    <span>Yield outlook</span>
                    <strong>+12%</strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon yellow">
                    <ThermometerSun size={21} />
                  </div>

                  <div>
                    <span>Farm health</span>
                    <strong>Good</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="section-heading">
                <div>
                  <p className="section-label">AI INSIGHTS</p>
                  <h3>Needs your attention</h3>
                </div>

                <span className="insight-count">3 active insights</span>
              </div>

              <div className="attention-grid">
                <div className="attention-card critical">
                  <div className="attention-top">
                    <span className="status-pill danger">
                      ACTION NEEDED
                    </span>

                    <Droplets size={21} />
                  </div>

                  <h4>North Plot irrigation risk</h4>

                  <p>
                    Soil moisture is below the preferred range and no
                    significant rainfall is expected in the next 48 hours.
                  </p>

                  <button type="button" className="card-action">
                    Investigate
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="attention-card warning">
                  <div className="attention-top">
                    <span className="status-pill warning">
                      INVESTIGATE
                    </span>

                    <Leaf size={21} />
                  </div>

                  <h4>Possible nutrient stress</h4>

                  <p>
                    East Plot shows a declining growth pattern compared with
                    the previous crop cycle.
                  </p>

                  <button type="button" className="card-action">
                    Ask agent
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="attention-card opportunity">
                  <div className="attention-top">
                    <span className="status-pill success">
                      OPPORTUNITY
                    </span>

                    <TrendingUp size={21} />
                  </div>

                  <h4>Market price movement</h4>

                  <p>
                    Current maize prices indicate a potentially favourable
                    selling window.
                  </p>

                  <button type="button" className="card-action">
                    View analysis
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </section>

            <section className="agent-preview">
              <div className="agent-avatar">
                <Bot size={25} />
              </div>

              <div className="agent-copy">
                <span className="agent-label">AGRIAGENT AI</span>

                <h3>Your farm agent is ready.</h3>

                <p>
                  Ask questions about your fields, investigate problems,
                  compare options or create an action plan.
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setActivePage("agent");
                  setSelectedField(null);
                }}
              >
                Talk to agent
                <ChevronRight size={17} />
              </button>
            </section>
          </>
        )}

        {/* MY FIELDS */}
        {activePage === "fields" && (
          <FieldsPage
            
onViewField={(fieldName, latitude, longitude) => {
  setSelectedField(fieldName);
  setFieldLatitude(latitude);
  setFieldLongitude(longitude);
  setActivePage("field-detail");
}}
          />
        )}

        {/* FIELD DETAIL */}
        {activePage === "field-detail" && selectedField && (
         
<FieldDetailPage
  fieldName={selectedField}
  weather={weather}
  onBack={() => {
    setSelectedField(null);
    setActivePage("fields");
  }}
/>
        )}

        {/* ALERTS */}
        {activePage === "alerts" && (
  <div className="alerts-page">
    <div className="alerts-page-header">
      <div>
        <p className="section-label">FARM MONITORING</p>

        <h2>Alerts</h2>

        <p>
          Important conditions that may need your attention.
        </p>
      </div>

      <div className="alerts-summary">
        <Bell size={18} />
        <span>3 active alerts</span>
      </div>
    </div>

    <div className="alerts-list">

      {/* NORTH PLOT ALERT */}
      <button
        type="button"
        className="alert-card"
        onClick={() => {
  
  setSelectedField("North Plot");
  setActivePage("field-detail");
}}
      >
        <div className="alert-icon">
          <Droplets size={21} />
        </div>

        <div className="alert-content">
          <span className="alert-type">
            IRRIGATION RISK
          </span>

          <h3>
            North Plot may need irrigation
          </h3>

          <p>
            Check soil moisture before the next irrigation cycle.
          </p>
        </div>

        <ChevronRight size={18} />
      </button>


      {/* WEATHER ALERT */}
      <button
        type="button"
        className="alert-card"
        onClick={() => {
          setActivePage("agent");
          setAgentMessage(
            "Should I irrigate my maize this week?"
          );
          setAgentResponse("");
        }}
      >
        <div className="alert-icon">
          <CloudRain size={21} />
        </div>

        <div className="alert-content">
          <span className="alert-type">
            WEATHER
          </span>

          <h3>
            Review rainfall before irrigating
          </h3>

          <p>
            Expected rainfall may affect your irrigation plans.
          </p>
        </div>

        <ChevronRight size={18} />
      </button>


      {/* FIELD HEALTH ALERT */}
      <button
        type="button"
        className="alert-card"
        onClick={() => {
          setActivePage("agent");
          setAgentMessage(
            "Which fields need attention today?"
          );
          setAgentResponse("");
        }}
      >
        <div className="alert-icon">
          <Leaf size={21} />
        </div>

        <div className="alert-content">
          <span className="alert-type">
            FIELD HEALTH
          </span>

          <h3>
            Continue monitoring crop condition
          </h3>

          <p>
            Watch your fields for signs of crop stress,
            pests, or disease.
          </p>
        </div>

        <ChevronRight size={18} />
      </button>

    </div>
  </div>
)}

        {/* MARKET INTELLIGENCE */}
        {activePage === "market" && <MarketIntelligence />}

        {/* FARM TEAM */}
        {activePage === "team" && <FarmTeam />}

        {/* FARM AGENT */}
        {activePage === "agent" && (
          <div className="farm-agent-page">
            <div className="agent-page-header">
              <div>
                <p className="section-label">AGRIAGENT AI</p>

                <h2>Farm Agent</h2>

                <p>
                  Your intelligent farming assistant for better field
                  decisions.
                </p>
              </div>

              <div className="agent-status">
                <span className="pulse-dot" />
                AI ONLINE
              </div>
            </div>

            <div className="agent-workspace">
              <div className="agent-welcome">
                <div className="agent-big-icon">
                  <Bot size={30} />
                </div>

                <span className="agent-label">YOUR FARM ASSISTANT</span>

                <h3>How can I help with your farm?</h3>

                <p>
                  Ask about your fields, irrigation, crop health, weather,
                  markets or what action you should take next.
                </p>
              </div>

              <div className="agent-suggestions">
                {/* NORTH PLOT */}
                <button
                  type="button"
                  className="agent-suggestion"
                  onClick={() =>
                    handleAgentSuggestion(
                      "What should I do about the irrigation risk?",
                      "North Plot"
                    )
                  }
                >
                  <span className="suggestion-icon water">
                    <Droplets size={19} />
                  </span>

                  <span>
                    <strong>North Plot</strong>
                    <small>
                      What should I do about the irrigation risk?
                    </small>
                  </span>

                  <ChevronRight size={17} />
                </button>

                {/* FIELD HEALTH */}
                <button
                  type="button"
                  className="agent-suggestion"
                  onClick={() =>
                    handleAgentSuggestion(
                      "Which fields need attention today?",
                      "All fields"
                    )
                  }
                >
                  <span className="suggestion-icon field">
                    <Leaf size={19} />
                  </span>

                  <span>
                    <strong>Field health</strong>
                    <small>
                      Which fields need attention today?
                    </small>
                  </span>

                  <ChevronRight size={17} />
                </button>

                {/* WEATHER */}
                <button
                  type="button"
                  className="agent-suggestion"
                  onClick={() =>
                    handleAgentSuggestion(
                      "Should I irrigate my maize this week?",
                       "Mapped farm area"
                    )
                  }
                >
                  <span className="suggestion-icon weather">
                    <CloudRain size={19} />
                  </span>

                  <span>
                    <strong>Weather</strong>
                    <small>
                      Should I irrigate my maize this week?
                    </small>
                  </span>

                  <ChevronRight size={17} />
                </button>

                {/* MARKET */}
                <button
                  type="button"
                  className="agent-suggestion"
                  onClick={() =>
                    handleAgentSuggestion(
                      "What is the current maize price outlook?"
                    )
                  }
                >
                  <span className="suggestion-icon market">
                    <TrendingUp size={19} />
                  </span>

                  <span>
                    <strong>Market intelligence</strong>
                    <small>
                      What is the current maize price outlook?
                    </small>
                  </span>

                  <ChevronRight size={17} />
                </button>
              </div>

              <div className="agent-input-placeholder">
                <Bot size={19} />

                <input
                  type="text"
                  value={agentMessage}
                  onChange={(e) => {
                    setAgentMessage(e.target.value);
                    setAgentResponse("");
                  }}
                  placeholder="Ask your farm agent anything..."
                />
              </div>

              <button
                type="button"
                className="agent-send-button"
                onClick={handleAskAgent}
              >
                Ask Agent
                <ChevronRight size={17} />
              </button>

              {agentResponse && (
  <div className="agent-response">
    <div className="agent-response-icon">
      <Bot size={20} />
    </div>

    <div>
      <span className="agent-label">AGRIAGENT AI</span>

      <h4>Farm Recommendation</h4>

      <p>{agentResponse}</p>
    </div>
  </div>
)}
            </div>

            <div className="agent-note">
              <span>●</span>
              AI recommendations will always be presented for your review
              before action.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;