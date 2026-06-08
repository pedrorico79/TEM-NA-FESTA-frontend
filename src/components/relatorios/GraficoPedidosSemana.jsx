import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

function GraficoPedidosSemana(props) {

    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={props.dados}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="rotulo" />

                <YAxis />

                <Tooltip
                    formatter={(value) => [value, "Pedidos"]}
                    labelFormatter={(label, payload) => {
                        const item = payload?.[0]?.payload;

                        return `${label} (${item?.periodo ?? ""})`;
                    }}
                />

                <Line
                    type="monotone"
                    dataKey="quantidade"
                    stroke="#6F4E37"
                    strokeWidth={3}
                />

            </LineChart>
        </ResponsiveContainer>
    );
}

export default GraficoPedidosSemana;