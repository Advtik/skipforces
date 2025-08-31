import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function ContestPieChart({ data }) {

  const COLORS = [ "#2196f3", "#f44336", "#ff9800"]; 
  // green, blue, red, orange (can change as per theme)

  return (
    <div id="piechart" className="flex justify-center items-center">
      <ResponsiveContainer width={500} height={330}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

