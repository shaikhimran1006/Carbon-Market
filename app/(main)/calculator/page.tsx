"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Car,
  Home,
  Utensils,
  Plane,
  Calculator,
  Leaf,
  TrendingUp,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface FormData {
  carType: string;
  milesPerWeek: number;
  publicTransit: number;
  homeSize: number;
  energySource: string;
  heatingType: string;
  diet: string;
  shortFlights: number;
  mediumFlights: number;
  longFlights: number;
}

interface Result {
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
  recommendedProjects: any[];
  offsetCost: number;
  creditsNeeded: number;
}

const COLORS = ["#10B981", "#0EA5E9", "#F59E0B", "#EF4444"];

export default function CalculatorPage() {
  const { addItem } = useCart();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const [formData, setFormData] = useState<FormData>({
    carType: "gas",
    milesPerWeek: 200,
    publicTransit: 0,
    homeSize: 1500,
    energySource: "mixed",
    heatingType: "gas",
    diet: "average",
    shortFlights: 2,
    mediumFlights: 1,
    longFlights: 0,
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const res = await fetch("/api/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setStep(5);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate footprint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleOffsetYear = async () => {
    if (!result) return;
    try {
      // Add first recommended project to cart with needed credits
      if (result.recommendedProjects[0]) {
        await addItem(result.recommendedProjects[0].id, result.creditsNeeded);
        toast({
          title: "Added to cart",
          description: `${result.creditsNeeded} credits added to offset your annual footprint.`,
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const pieData = result
    ? [
      { name: "Transportation", value: result.breakdown.transportation },
      { name: "Home Energy", value: result.breakdown.homeEnergy },
      { name: "Diet", value: result.breakdown.diet },
      { name: "Travel", value: result.breakdown.travel },
    ]
    : [];

  const comparisonData = result
    ? [
      { name: "You", value: result.total, fill: "#10B981" },
      { name: "US Average", value: result.comparison.usAverage, fill: "#94A3B8" },
      { name: "World Average", value: result.comparison.worldAverage, fill: "#CBD5E1" },
    ]
    : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Calculator className="w-4 h-4" />
          Carbon Footprint Calculator
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calculate Your Carbon Footprint</h1>
        <p className="text-gray-600">
          Answer a few questions about your lifestyle to discover your annual carbon emissions
        </p>
      </div>

      {/* Progress Indicator */}
      {step < 5 && (
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <Progress value={(step / 4) * 100} />
        </div>
      )}

      {/* Step 1: Transportation */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Car className="w-6 h-6 text-primary" />
              <CardTitle>Transportation</CardTitle>
            </div>
            <CardDescription>Tell us about your daily commute and travel habits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>What type of car do you drive?</Label>
              <RadioGroup
                value={formData.carType}
                onValueChange={(v) => updateField("carType", v)}
                className="grid grid-cols-2 gap-4 mt-2"
              >
                {[
                  { value: "electric", label: "🔌 Electric" },
                  { value: "hybrid", label: "🔋 Hybrid" },
                  { value: "gas", label: "⛽ Gasoline" },
                  { value: "diesel", label: "🛢️ Diesel" },
                ].map((option) => (
                  <div key={option.value}>
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.value}
                      className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label>Miles driven per week: {formData.milesPerWeek}</Label>
              <Slider
                value={[formData.milesPerWeek]}
                onValueChange={([v]) => updateField("milesPerWeek", v)}
                max={500}
                step={10}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Hours of public transit per week: {formData.publicTransit}</Label>
              <Slider
                value={[formData.publicTransit]}
                onValueChange={([v]) => updateField("publicTransit", v)}
                max={40}
                step={1}
                className="mt-2"
              />
            </div>

            <Button onClick={() => setStep(2)} className="w-full">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Home Energy */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6 text-primary" />
              <CardTitle>Home Energy</CardTitle>
            </div>
            <CardDescription>Tell us about your home and energy usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Home size (sq ft): {formatNumber(formData.homeSize)}</Label>
              <Slider
                value={[formData.homeSize]}
                onValueChange={([v]) => updateField("homeSize", v)}
                min={500}
                max={5000}
                step={100}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Energy source</Label>
              <Select value={formData.energySource} onValueChange={(v) => updateField("energySource", v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="renewable">🌱 100% Renewable</SelectItem>
                  <SelectItem value="mixed">⚡ Mixed (Grid Average)</SelectItem>
                  <SelectItem value="fossil">🏭 Mostly Fossil Fuels</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Heating type</Label>
              <Select value={formData.heatingType} onValueChange={(v) => updateField("heatingType", v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heatPump">🌡️ Heat Pump</SelectItem>
                  <SelectItem value="electric">⚡ Electric</SelectItem>
                  <SelectItem value="gas">🔥 Natural Gas</SelectItem>
                  <SelectItem value="oil">🛢️ Oil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Diet */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Utensils className="w-6 h-6 text-primary" />
              <CardTitle>Diet</CardTitle>
            </div>
            <CardDescription>Your food choices have a significant impact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Describe your diet</Label>
              <RadioGroup
                value={formData.diet}
                onValueChange={(v) => updateField("diet", v)}
                className="grid gap-3 mt-2"
              >
                {[
                  { value: "vegan", label: "🥬 Vegan", desc: "No animal products" },
                  { value: "vegetarian", label: "🥚 Vegetarian", desc: "No meat, but dairy/eggs" },
                  { value: "lowMeat", label: "🥗 Low Meat", desc: "Meat 1-2 times per week" },
                  { value: "average", label: "🍖 Average", desc: "Meat most days" },
                  { value: "highMeat", label: "🥩 High Meat", desc: "Meat every meal" },
                ].map((option) => (
                  <div key={option.value}>
                    <RadioGroupItem
                      value={option.value}
                      id={`diet-${option.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`diet-${option.value}`}
                      className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span>{option.label}</span>
                      <span className="text-sm text-gray-500">{option.desc}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Travel */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plane className="w-6 h-6 text-primary" />
              <CardTitle>Air Travel</CardTitle>
            </div>
            <CardDescription>Flying is one of the most carbon-intensive activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Short flights per year (&lt;3 hours): {formData.shortFlights}</Label>
              <Slider
                value={[formData.shortFlights]}
                onValueChange={([v]) => updateField("shortFlights", v)}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Medium flights per year (3-6 hours): {formData.mediumFlights}</Label>
              <Slider
                value={[formData.mediumFlights]}
                onValueChange={([v]) => updateField("mediumFlights", v)}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Long flights per year (&gt;6 hours): {formData.longFlights}</Label>
              <Slider
                value={[formData.longFlights]}
                onValueChange={([v]) => updateField("longFlights", v)}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleCalculate} disabled={isCalculating} className="flex-1">
                {isCalculating ? "Calculating..." : "Calculate My Footprint"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Results */}
      {step === 5 && result && (
        <div className="space-y-6">
          {/* Main Result */}
          <Card className="bg-gradient-to-br from-primary-50 to-white">
            <CardContent className="pt-8 text-center">
              <p className="text-gray-600 mb-2">Your Annual Carbon Footprint</p>
              <div className="text-6xl font-bold text-primary mb-2">{result.total}</div>
              <p className="text-xl text-gray-700 mb-4">tons of CO₂ per year</p>
              <div className="flex justify-center gap-8 text-sm">
                <div>
                  <span className="text-gray-500">vs US Average:</span>{" "}
                  <span
                    className={result.total < result.comparison.usAverage ? "text-green-600" : "text-red-600"}
                  >
                    {result.comparison.percentOfUS}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">vs World Average:</span>{" "}
                  <span
                    className={result.total < result.comparison.worldAverage ? "text-green-600" : "text-red-600"}
                  >
                    {result.comparison.percentOfWorld}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Breakdown by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}t`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value} tons`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>How You Compare</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} layout="vertical">
                      <XAxis type="number" unit=" tons" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(value: number) => `${value} tons`} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Ways to Reduce Your Footprint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.recommendations.map((rec, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{rec.suggestion}</p>
                        <p className="text-sm text-gray-500">{rec.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-green-600 font-semibold">
                          -{rec.potentialSavings} tons/year
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Offset CTA */}
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                Offset Your Carbon Footprint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <p className="text-gray-600 mb-4">
                    Ready to neutralize your environmental impact? You can offset your entire annual
                    footprint of <strong>{result.total} tons</strong> for approximately{" "}
                    <strong className="text-primary">{formatCurrency(result.offsetCost)}</strong>.
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={handleOffsetYear} className="gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Offset My Year
                    </Button>
                    <Link href="/projects">
                      <Button variant="outline">Browse All Projects</Button>
                    </Link>
                  </div>
                </div>
                <div className="text-center p-6 bg-primary/10 rounded-lg">
                  <div className="text-4xl font-bold text-primary">{result.creditsNeeded}</div>
                  <div className="text-sm text-gray-600">credits needed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Over */}
          <div className="text-center">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Calculate Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
