import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell
} from "recharts";

function GraficoComparativoEventos({ dados }) {

    const cores = [
        "#4F7DF0",
        "#A78BFA",
        "#F0B562",
        "#F4D64D"
    ];

    return (
        <ResponsiveContainer width="100%" height={300}>

            <BarChart data={dados}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="evento" />

                <YAxis />

                <Tooltip />

                <Bar
                    dataKey="pedidos"
                    radius={[15, 15, 0, 0]}
                >
                    {dados.map((item, index) => (
                        <Cell
                            key={index}
                            fill={cores[index % cores.length]}
                        />
                    ))}
                </Bar>

            </BarChart>

        </ResponsiveContainer>
    );
}

export default GraficoComparativoEventos;