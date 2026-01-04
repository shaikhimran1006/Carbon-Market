export interface FootprintData {
  carType: "electric" | "hybrid" | "gas" | "diesel";
  milesPerWeek: number;
  publicTransit: number; // hours per week
  homeSize: number; // sq ft
  energySource: "renewable" | "mixed" | "fossil";
  heatingType: "electric" | "gas" | "oil" | "heatPump";
  diet: "vegan" | "vegetarian" | "lowMeat" | "average" | "highMeat";
  shortFlights: number; // per year
  mediumFlights: number; // per year
  longFlights: number; // per year
}

export interface FootprintResult {
  total: number;
  breakdown: {
    transportation: number;
    homeEnergy: number;
    diet: number;
    travel: number;
  };
  comparison: {
    usAverage: number;
    worldAverage: number;
    percentOfUS: number;
    percentOfWorld: number;
  };
  recommendations: {
    category: string;
    suggestion: string;
    potentialSavings: number;
  }[];
}

export function calculateFootprint(data: FootprintData): FootprintResult {
  let transportation = 0;
  let homeEnergy = 0;
  let diet = 0;
  let travel = 0;

  // Transportation (tons CO2/year)
  const carEmissions: Record<string, number> = {
    electric: 0.5,
    hybrid: 1.5,
    gas: 4.6,
    diesel: 5.2,
  };
  transportation = carEmissions[data.carType] * (data.milesPerWeek / 200);
  // Subtract public transit savings
  transportation -= data.publicTransit * 0.05;
  transportation = Math.max(0, transportation);

  // Home Energy (tons CO2/year)
  const homeBase = data.homeSize / 1000;
  const energyMultiplier: Record<string, number> = {
    renewable: 0.2,
    mixed: 0.6,
    fossil: 1.0,
  };
  const heatingMultiplier: Record<string, number> = {
    heatPump: 0.5,
    electric: 0.8,
    gas: 1.0,
    oil: 1.3,
  };
  homeEnergy = homeBase * energyMultiplier[data.energySource] * heatingMultiplier[data.heatingType] * 3;

  // Diet (tons CO2/year)
  const dietEmissions: Record<string, number> = {
    vegan: 1.5,
    vegetarian: 1.7,
    lowMeat: 2.5,
    average: 3.3,
    highMeat: 4.5,
  };
  diet = dietEmissions[data.diet];

  // Travel/Flights (tons CO2/year)
  travel = data.shortFlights * 0.25 + data.mediumFlights * 0.75 + data.longFlights * 2.0;

  const total = Math.round((transportation + homeEnergy + diet + travel) * 10) / 10;

  const usAverage = 16;
  const worldAverage = 4;

  // Generate recommendations
  const recommendations: FootprintResult["recommendations"] = [];

  if (data.carType === "gas" || data.carType === "diesel") {
    recommendations.push({
      category: "Transportation",
      suggestion: "Consider switching to an electric or hybrid vehicle",
      potentialSavings: Math.round((carEmissions[data.carType] - carEmissions.hybrid) * (data.milesPerWeek / 200) * 10) / 10,
    });
  }

  if (data.energySource === "fossil") {
    recommendations.push({
      category: "Home Energy",
      suggestion: "Switch to a renewable energy provider",
      potentialSavings: Math.round(homeBase * 0.8 * 3 * 10) / 10,
    });
  }

  if (data.diet === "highMeat" || data.diet === "average") {
    recommendations.push({
      category: "Diet",
      suggestion: "Reduce meat consumption to lower your carbon footprint",
      potentialSavings: Math.round((dietEmissions[data.diet] - dietEmissions.lowMeat) * 10) / 10,
    });
  }

  if (data.longFlights > 2) {
    recommendations.push({
      category: "Travel",
      suggestion: "Consider alternatives to long-haul flights when possible",
      potentialSavings: Math.round((data.longFlights - 2) * 2 * 10) / 10,
    });
  }

  return {
    total,
    breakdown: {
      transportation: Math.round(transportation * 10) / 10,
      homeEnergy: Math.round(homeEnergy * 10) / 10,
      diet: Math.round(diet * 10) / 10,
      travel: Math.round(travel * 10) / 10,
    },
    comparison: {
      usAverage,
      worldAverage,
      percentOfUS: Math.round((total / usAverage) * 100),
      percentOfWorld: Math.round((total / worldAverage) * 100),
    },
    recommendations,
  };
}
