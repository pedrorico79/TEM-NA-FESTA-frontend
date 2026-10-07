import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

function TickSemana({ x, y, index, payload, dados }) {
    const indiceSemana = dados.findIndex((item) => item.rotulo === payload?.value);
    const semana = dados[indiceSemana >= 0 ? indiceSemana : index];
    if (!semana) return null;

    const periodo = String(semana.periodo || "").replace(/\s*-\s*/, "–");
    const textAnchor = indiceSemana === 0
        ? "start"
        : indiceSemana === dados.length - 1
            ? "end"
            : "middle";

    return (
        <g transform={`translate(${x},${y})`}>
            <text textAnchor={textAnchor} fill="#594133" fontSize={11}>
                <tspan x={0} dy={10}>{semana.rotulo}</tspan>
                <tspan x={0} dy={14} fontSize={10}>{periodo}</tspan>
            </text>
        </g>
    );
}

function GraficoPedidosSemana(props) {
    const dados = props.dados || [];
    const quantidadeMaximaRotulos = 5;
    const passoRotulos = Math.max(1, Math.ceil((dados.length - 1) / (quantidadeMaximaRotulos - 1)));
    const indicesRotulos = new Set([0, dados.length - 1]);
    for (let indice = passoRotulos; indice < dados.length - 1; indice += passoRotulos) {
        indicesRotulos.add(indice);
    }
    const rotulosVisiveis = [...indicesRotulos]
        .filter((indice) => indice >= 0 && indice < dados.length)
        .sort((a, b) => a - b)
        .map((indice) => dados[indice].rotulo);

    return (
        <div className="grafico-relatorio-wrapper">
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dados} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="rotulo"
                        height={50}
                        ticks={rotulosVisiveis}
                        interval={0}
                        tick={<TickSemana dados={dados} />}
                    />
                    <YAxis width={32} tick={{ fontSize: 12 }} />
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
        </div>
    );
}

export default GraficoPedidosSemana;
