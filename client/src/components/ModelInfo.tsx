import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BadgeCheck, Database, Layers, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";

const accuracyData = [
  { epoch: 1, accuracy: 65 },
  { epoch: 5, accuracy: 78 },
  { epoch: 10, accuracy: 85 },
  { epoch: 15, accuracy: 92 },
  { epoch: 20, accuracy: 95 },
  { epoch: 25, accuracy: 98.5 },
];

export function ModelInfo() {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Model Accuracy"
          value="98.5%"
          description="Test set validation"
          icon={BadgeCheck}
          trend="+2.4%"
        />
        <MetricCard
          title="Dataset Size"
          value="7,023"
          description="MRI Scan Images"
          icon={Database}
        />
        <MetricCard
          title="Architecture"
          value="CNN"
          description="Deep Learning"
          icon={Layers}
        />
        <MetricCard
          title="Classes"
          value="4"
          description="Tumor types"
          icon={BrainCircuit}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-slate-100 shadow-lg">
          <CardHeader>
            <CardTitle>Training Performance</CardTitle>
            <CardDescription>Accuracy metrics over 25 epochs of training</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyData}>
                <defs>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="epoch" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAccuracy)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-100 shadow-lg h-full">
            <CardHeader>
              <CardTitle>Dataset Classes</CardTitle>
              <CardDescription>Kaggle Brain Tumor MRI Dataset</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[
                  { name: 'Glioma Tumor', count: '1621 samples', color: 'bg-rose-500' },
                  { name: 'Meningioma Tumor', count: '1645 samples', color: 'bg-purple-500' },
                  { name: 'Pituitary Tumor', count: '1757 samples', color: 'bg-indigo-500' },
                  { name: 'No Tumor', count: '2000 samples', color: 'bg-emerald-500' },
                ].map((item) => (
                  <li key={item.name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.count}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
