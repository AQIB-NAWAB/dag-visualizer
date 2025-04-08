import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

export default function DAGVisualizer() {
  const [nodes, setNodes] = useState([
    { id: "A" },
    { id: "B" },
    { id: "C" },
    { id: "D" },
  ]);
  const [links, setLinks] = useState([
    { source: "A", target: "B" },
    { source: "B", target: "C" },
    { source: "A", target: "D" },
  ]);

  const svgRef = useRef();

  const addNode = () => {
    const newNodeId = String.fromCharCode(65 + nodes.length); // A = 65
    const newNode = { id: newNodeId };

    let newLinks = [...links];
    if (nodes.length > 0) {
      newLinks.push({ source: nodes[nodes.length - 1].id, target: newNodeId });
    }

    setNodes([...nodes, newNode]);
    setLinks(newLinks);
  };

  useEffect(() => {
    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .style("border", "1px solid #ccc");

    // Set up the D3 force simulation.
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create links (lines).
    const link = svg
      .selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2);

    const node = svg
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 20)
      .attr("fill", "#69b3a2")
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    const label = svg
      .selectAll(".label")
      .data(nodes)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .text((d) => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      label.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });

    simulation.alpha(1).restart();
  }, [nodes, links]);

  return (
    <div>
      <button onClick={addNode}>Add Node</button>
      <svg ref={svgRef}></svg>
    </div>
  );
}
