import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

function GraficoPedidosSemana({ dados }) {

    return (
        <ResponsiveContainer width="100%" height={250}>

            <LineChart data={dados}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="semana" />

                <YAxis />

                <Tooltip />

                <Line
                    type="monotone"
                    dataKey="pedidos"
                    stroke="#6F4E37"
                    strokeWidth={3}
                />

            </LineChart>

        </ResponsiveContainer>
    );
}

export default GraficoPedidosSemana;