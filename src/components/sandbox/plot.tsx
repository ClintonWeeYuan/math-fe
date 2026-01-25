import { useState, useRef } from 'react'
import { Trash2, Plus, Minus, Move } from 'lucide-react'

type Point = { x: number; y: number }
type PointWithId = Point & { id: number }
type Line = { start: Point; end: Point }
type LineWithId = Line & { id: number }

const xSUBDIVISIONS = 10
const ySUBDIVISIONS = 10

type Mode = 'point' | 'line' | 'select'

export function Plot() {
    const [points, setPoints] = useState<PointWithId[]>([])
    const [lines, setLines] = useState<LineWithId[]>([])
    const [mode, setMode] = useState<Mode>('select')
    const [tempLine, setTempLine] = useState<Line | null>(null)
    const [selectedPoint, setSelectedPoint] = useState<PointWithId | null>(null)
    const [selectedLine, setSelectedLine] = useState<LineWithId | null>(null)
    const [lineOffset, setLineOffset] = useState<Point | null>(null)
    const [dragType, setDragType] = useState<'line' | 'point' | null>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [xDivision, setXDivision] = useState(2)
    const [yDivision, setYDivision] = useState(2)
    const svgRef = useRef<SVGSVGElement | null>(null)

    const width = 800
    const height = 720
    const padding = 50

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const { key } = e

        if (key !== 'Backspace') {
            return
        }

        if (selectedPoint !== null) {
            setPoints((prev) => prev.filter((p) => p.id !== selectedPoint.id))
            setSelectedPoint(null)
        }

        if (selectedLine !== null) {
            setLines((prev) => prev.filter((l) => l.id !== selectedLine.id))
            setSelectedLine(null)
        }
    }

    // Convert SVG coordinates to graph coordinates
    const svgToGraph = ({ x, y }: Point) => {
        const graphX = ((x - padding) / (width - 2 * padding)) * 20 - 10
        const graphY = (1 - (y - padding) / (height - 2 * padding)) * 24 - 12
        return {
            x: Math.round(graphX * 10) / 10,
            y: Math.round(graphY * 10) / 10,
        }
    }

    // Convert graph coordinates to SVG coordinates
    const graphToSvg = ({ x, y }: Point) => {
        const svgX = ((x + 10) / 20) * (width - 2 * padding) + padding
        const svgY = (1 - (y + 12) / 24) * (height - 2 * padding) + padding
        return { x: svgX, y: svgY }
    }

    // Get mouse position relative to SVG
    const getMousePos = (
        e: React.MouseEvent<SVGSVGElement | SVGLineElement, MouseEvent>
    ) => {
        const rect = svgRef.current?.getBoundingClientRect()

        if (rect == undefined) {
            return null
        }

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
    }

    // Handle SVG click
    const handleSvgClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        if (isDragging) return

        const mousePos = getMousePos(e)
        if (mousePos == null) {
            return
        }

        const graphPos = svgToGraph({ x: mousePos.x, y: mousePos.y })

        if (mode === 'point') {
            const newPoint = {
                id: Date.now(),
                ...graphPos,
            }
            setPoints((prev) => [...prev, newPoint])
        } else if (mode === 'line') {
            if (!tempLine) {
                // Start new line
                setTempLine({ start: graphPos, end: graphPos })
            } else {
                // Complete line
                const newLine = {
                    id: Date.now(),
                    start: tempLine.start,
                    end: graphPos,
                }
                setLines((prev) => [...prev, newLine])
                setTempLine(null)
            }
        }
    }

    // Handle mouse move for temporary line
    const handleMouseMove = (
        e: React.MouseEvent<SVGSVGElement, MouseEvent>
    ) => {
        if (mode === 'line' && tempLine !== null) {
            const mousePos = getMousePos(e)
            if (mousePos == null) {
                return
            }

            const graphPos = svgToGraph({ x: mousePos.x, y: mousePos.y })
            setTempLine({ ...tempLine, end: graphPos })
        }
    }

    // Handle point mouse down for dragging
    const handlePointMouseDown = (
        e: React.MouseEvent<SVGCircleElement, MouseEvent>,
        point: PointWithId
    ) => {
        e.stopPropagation()
        setSelectedPoint(point)
        setSelectedLine(null)
        setIsDragging(true)
        setDragType('point')
    }

    // Handle point mouse down for dragging
    const handleLineMouseDown = (
        e: React.MouseEvent<SVGLineElement, MouseEvent>,
        line: LineWithId
    ) => {
        e.stopPropagation()
        const mousePos = getMousePos(e)
        if (mousePos == null) {
            return
        }

        const graphPos = svgToGraph(mousePos)

        // Calculate offset from line's start point to mouse position
        const offset = {
            x: graphPos.x - line.start.x,
            y: graphPos.y - line.start.y,
        }

        setDragType('line')
        setLineOffset(offset)
        setSelectedLine(line)
        setSelectedPoint(null)
        setIsDragging(true)
    }

    // Handle point dragging
    const handlePointDrag = (
        e: React.MouseEvent<SVGSVGElement, MouseEvent>
    ) => {
        if (!isDragging || !selectedPoint || dragType !== 'point') return

        const mousePos = getMousePos(e)
        if (mousePos == null) {
            return
        }

        const graphPos = svgToGraph(mousePos)

        setPoints((prev) =>
            prev.map((p) =>
                p.id === selectedPoint.id
                    ? { ...p, x: graphPos.x, y: graphPos.y }
                    : p
            )
        )
    }

    // Handle point dragging
    const handleLineDrag = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        if (!isDragging || !selectedLine || dragType !== 'line') return

        const mousePos = getMousePos(e)
        if (mousePos == null) {
            return
        }

        const graphPos = svgToGraph(mousePos)

        // Calculate new line position based on offset
        const newStart = {
            x: graphPos.x - (lineOffset?.x ?? 0),
            y: graphPos.y - (lineOffset?.y ?? 0),
        }

        // Calculate how much to move the line
        const deltaX = newStart.x - selectedLine.start.x
        const deltaY = newStart.y - selectedLine.start.y

        const newEnd = {
            x: selectedLine.end.x + deltaX,
            y: selectedLine.end.y + deltaY,
        }

        setLines((prev) =>
            prev.map((l) =>
                l.id === selectedLine.id
                    ? { ...l, start: newStart, end: newEnd }
                    : l
            )
        )
    }

    // Handle mouse up
    const handleMouseUp = () => {
        setIsDragging(false)
        setDragType(null)
    }

    // Clear all points and lines
    const clearAll = () => {
        setPoints([])
        setLines([])
        setTempLine(null)
    }

    // Generate grid lines
    const generateGridLines = () => {
        const gridLines = []

        // Major vertical lines
        for (let i = -10; i <= 10; i += xDivision) {
            const svgPos = graphToSvg({ x: i, y: 0 })
            gridLines.push(
                <line
                    key={`v-major-${i}`}
                    x1={svgPos.x}
                    y1={padding}
                    x2={svgPos.x}
                    y2={height - padding}
                    stroke="#d1d5db"
                    strokeWidth="1"
                />
            )
        }

        // Minor vertical lines (subdivisions)
        const xSubdivisionSize = xDivision / ySUBDIVISIONS
        for (let i = -10; i <= 10; i += xSubdivisionSize) {
            if (i % xDivision === 0) continue // Skip major lines
            const svgPos = graphToSvg({ x: i, y: 0 })
            gridLines.push(
                <line
                    key={`v-minor-${i}`}
                    x1={svgPos.x}
                    y1={padding}
                    x2={svgPos.x}
                    y2={height - padding}
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                />
            )
        }

        // Major horizontal lines
        for (let i = -12; i <= 12; i += yDivision) {
            const svgPos = graphToSvg({ x: 0, y: i })
            gridLines.push(
                <line
                    key={`h-major-${i}`}
                    x1={padding}
                    y1={svgPos.y}
                    x2={width - padding}
                    y2={svgPos.y}
                    stroke="#d1d5db"
                    strokeWidth="1"
                />
            )
        }

        // Minor horizontal lines (subdivisions)
        const ySubdivisionSize = yDivision / ySUBDIVISIONS
        for (let i = -12; i <= 12; i += ySubdivisionSize) {
            if (i % yDivision === 0) continue // Skip major lines
            const svgPos = graphToSvg({ x: 0, y: i })
            gridLines.push(
                <line
                    key={`h-minor-${i}`}
                    x1={padding}
                    y1={svgPos.y}
                    x2={width - padding}
                    y2={svgPos.y}
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                />
            )
        }

        return gridLines
    }

    // Generate axis labels
    const generateAxisLabels = () => {
        const labels = []

        // X-axis labels
        for (let i = -10; i <= 10; i += xDivision * 2) {
            if (i === 0) continue
            const svgPos = graphToSvg({ x: i, y: 0 })
            labels.push(
                <text
                    key={`x-${i}`}
                    x={svgPos.x}
                    y={svgPos.y + 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6b7280"
                >
                    {i}
                </text>
            )
        }

        // Y-axis labels
        for (let i = -12; i <= 12; i += yDivision * 2) {
            if (i === 0) continue
            const svgPos = graphToSvg({ x: 0, y: i })
            labels.push(
                <text
                    key={`y-${i}`}
                    x={svgPos.x - 20}
                    y={svgPos.y + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6b7280"
                >
                    {i}
                </text>
            )
        }

        return labels
    }

    const originSvg = graphToSvg({ x: 0, y: 0 })

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Custom Graph Plotter
                </h1>

                {/* Grid Controls */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <h3 className="text-lg font-semibold mb-3">
                        Grid Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Horizontal (X-axis) Controls */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-700">
                                Horizontal (X-axis)
                            </h4>
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-600 min-w-0">
                                    Major divisions:
                                </label>
                                <select
                                    value={xDivision}
                                    onChange={(e) =>
                                        setXDivision(Number(e.target.value))
                                    }
                                    className="px-2 py-1 border rounded text-sm"
                                >
                                    <option value={0.5}>0.5</option>
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={2.5}>2.5</option>
                                    <option value={4}>4</option>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                </select>
                            </div>
                            <div className="text-xs text-gray-500">
                                Minor grid:{' '}
                                {(xDivision / xSUBDIVISIONS).toFixed(2)} units
                            </div>
                        </div>

                        {/* Vertical (Y-axis) Controls */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-700">
                                Vertical (Y-axis)
                            </h4>
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-600 min-w-0">
                                    Major divisions:
                                </label>
                                <select
                                    value={yDivision}
                                    onChange={(e) =>
                                        setYDivision(Number(e.target.value))
                                    }
                                    className="px-2 py-1 border rounded text-sm"
                                >
                                    <option value={0.5}>0.5</option>
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={2.5}>2.5</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4</option>
                                    <option value={6}>6</option>
                                </select>
                            </div>
                            <div className="text-xs text-gray-500">
                                Minor grid:{' '}
                                {(yDivision / ySUBDIVISIONS).toFixed(2)} units
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode('select')}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                    mode === 'select'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <Move size={16} />
                                Select/Move
                            </button>
                            <button
                                onClick={() => setMode('point')}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                    mode === 'point'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <Plus size={16} />
                                Add Points
                            </button>
                            <button
                                onClick={() => setMode('line')}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                    mode === 'line'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <Minus size={16} />
                                Draw Lines
                            </button>
                        </div>

                        <button
                            onClick={clearAll}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Clear All
                        </button>

                        <div className="text-sm text-gray-600">
                            {mode === 'point' &&
                                'Click to add points, drag to move them'}
                            {mode === 'line' &&
                                'Click two points to draw a line'}
                            {mode === 'select' &&
                                'Select or drag to update points/lines'}
                        </div>
                    </div>
                </div>

                {/* Graph */}
                <div
                    className="bg-white rounded-lg shadow-md p-4"
                    tabIndex={0}
                    onKeyDown={onKeyDown}
                >
                    <svg
                        ref={svgRef}
                        width={width}
                        height={height}
                        className="border rounded"
                        style={{
                            cursor: mode == 'select' ? 'move' : 'crosshair',
                        }}
                        onClick={handleSvgClick}
                        onMouseMove={(e) => {
                            handleMouseMove(e)
                            handlePointDrag(e)
                            handleLineDrag(e)
                        }}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* Grid */}
                        {generateGridLines()}

                        {/* Axes */}
                        <line
                            x1={padding}
                            y1={originSvg.y}
                            x2={width - padding}
                            y2={originSvg.y}
                            stroke="#374151"
                            strokeWidth="2"
                        />
                        <line
                            x1={originSvg.x}
                            y1={padding}
                            x2={originSvg.x}
                            y2={height - padding}
                            stroke="#374151"
                            strokeWidth="2"
                        />

                        {/* Axis labels */}
                        {generateAxisLabels()}

                        {/* Origin label */}
                        <text
                            x={originSvg.x - 15}
                            y={originSvg.y + 15}
                            fontSize="12"
                            fill="#374151"
                        >
                            0
                        </text>

                        {/* Lines */}
                        {lines.map((line) => {
                            const startSvg = graphToSvg(line.start)
                            const endSvg = graphToSvg(line.end)
                            const isSelected =
                                selectedLine && selectedLine.id === line.id

                            return (
                                <g key={line.id}>
                                    <line
                                        x1={startSvg.x}
                                        y1={startSvg.y}
                                        x2={endSvg.x}
                                        y2={endSvg.y}
                                        stroke={
                                            isSelected ? '#f59e0b' : '#10b981'
                                        }
                                        strokeWidth={isSelected ? '3' : '2'}
                                        className="cursor-move hover:stroke-orange-500"
                                        onMouseDown={(e) =>
                                            handleLineMouseDown(e, line)
                                        }
                                    />
                                    {/* Invisible wider line for easier clicking */}
                                    <line
                                        x1={startSvg.x}
                                        y1={startSvg.y}
                                        x2={endSvg.x}
                                        y2={endSvg.y}
                                        stroke="transparent"
                                        strokeWidth="8"
                                        className="cursor-move"
                                        onMouseDown={(e) =>
                                            handleLineMouseDown(e, line)
                                        }
                                    />
                                </g>
                            )
                        })}

                        {/* Temporary line */}
                        {tempLine && (
                            <line
                                x1={
                                    graphToSvg({
                                        x: tempLine.start.x,
                                        y: tempLine.start.y,
                                    }).x
                                }
                                y1={
                                    graphToSvg({
                                        x: tempLine.start.x,
                                        y: tempLine.start.y,
                                    }).y
                                }
                                x2={
                                    graphToSvg({
                                        x: tempLine.end.x,
                                        y: tempLine.end.y,
                                    }).x
                                }
                                y2={
                                    graphToSvg({
                                        x: tempLine.end.x,
                                        y: tempLine.end.y,
                                    }).y
                                }
                                stroke="#f59e0b"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                            />
                        )}

                        {/* Points */}
                        {points.map((point) => {
                            const svgPos = graphToSvg(point)
                            const isSelected = selectedPoint?.id == point.id

                            return (
                                <g key={point.id}>
                                    <circle
                                        cx={svgPos.x}
                                        cy={svgPos.y}
                                        r="6"
                                        fill="#3b82f6"
                                        stroke={
                                            isSelected ? '#f59e0b' : '#fffff'
                                        }
                                        strokeWidth={isSelected ? '3' : '2'}
                                        className="cursor-grab hover:fill-blue-600"
                                        onMouseDown={(e) =>
                                            handlePointMouseDown(e, point)
                                        }
                                    />
                                    <text
                                        x={svgPos.x + 10}
                                        y={svgPos.y - 10}
                                        fontSize="10"
                                        fill="#374151"
                                        className="pointer-events-none select-none"
                                    >
                                        ({point.x}, {point.y})
                                    </text>
                                </g>
                            )
                        })}
                    </svg>
                </div>
            </div>
        </div>
    )
}
