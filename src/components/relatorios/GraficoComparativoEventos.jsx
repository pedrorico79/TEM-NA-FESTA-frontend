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

function GraficoComparativoEventos(props) {

    const dados = props.dados || [];

    const cores = [
        "#4F7DF0",
        "#A78BFA",
        "#F0B562",
        "#F4D64D"
    ];

    return (
        <div className="grafico-relatorio-wrapper">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dados} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="evento" tick={{ fontSize: 12 }} />
                    <YAxis width={32} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="pedidosTotais" radius={[15, 15, 0, 0]}>
                        {dados.map((item, index) => (
                            <Cell key={index} fill={cores[index % cores.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default GraficoComparativoEventos;
