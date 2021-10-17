import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'family-hierarchy-frontend';

  treeMap: any = null;
  nodes: any = null;
  svg: any = null;
  svgGroup: any = null;
  root: any = null;
  viewerHeight = 900;
  viewerWidth = 500;

  constructor() {
    console.log("AppComponent");
    // Called first time before the ngOnInit()
  }

  ngOnInit() {
    console.log("ngOnInit");
    var treeData =
    {
      "name": "Top Level",
      "children": [
        {
          "name": "Level 2: A",
          "children": [
            { "name": "Son of A" },
            { "name": "Daughter of A" }
          ]
        },
        { "name": "Level 2: B" }
      ]
    };
    // set the dimensions and margins of the diagram
    var margin = { top: 20, right: 90, bottom: 30, left: 90 },
      width = 660 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // declares a tree layout and assigns the size
    this.treeMap = d3.tree().size([height, width]);

    // append the svg object to the div#tree of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    this.svg = d3.select("div#tree").append("svg").attr("class","overlay").attr("height", this.viewerHeight).attr("width", this.viewerWidth);
    this.svgGroup = this.svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Assigns parent, children, height, depth
		this.root = d3.hierarchy(treeData, function(d) {
			return d.children;
		});
		this.root.x0 = height / 2;
		this.root.y0 = 0;

    // Layout the tree initially and center on the root node.
    this.updateTree(this.root);
  }

  updateTree(source: any) {
    console.log("updateTree:", source);
    // var levelWidth = [1];
    // var childCount = function(level, n) {

    //   if (n.children && n.children.length > 0) {
    //     if (levelWidth.length <= level + 1) levelWidth.push(0);

    //     levelWidth[level + 1] += n.children.length;
    //     n.children.forEach(function(d) {
    //       childCount(level + 1, d);
    //     });
    //   }
    // };
    // childCount(0, source);
    // var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line
    // this.tree = this.tree.size([newHeight, this.viewerWidth]);

    //  assigns the data to a hierarchy using parent-child relationships
    this.nodes = d3.hierarchy(this.root, function (d) {
      return d.children;
    });

    // maps the node data to the tree layout
    this.nodes = this.tree(this.nodes);

    var self = this;
    // adds the links between the nodes
    var link = this.svgGroup.selectAll(".link")
      .data(this.nodes.descendants().slice(1))
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", "2px")
      .attr("d", function (d) {
        return "M" + d.x + "," + d.y
          + "C" + d.x + "," + (d.parent.y + d.y) / 2
          + " " + d.parent.x + "," + (d.y + d.parent.y) / 2
          + " " + d.parent.x + "," + d.parent.y;
      });
    // adds each node as a group
    var node = this.svgGroup.selectAll(".node")
      .data(this.nodes.descendants())
      .enter().append("g")
      .attr("class", function (d) {
        return "node" +
          (d.children ? " node--internal" : " node--leaf");
      })
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      .on('click', self.nodeClick);

    // adds the circle to the node
    node.append("circle")
      .attr("stroke-width", "3px")
      .attr("stroke", "steelblue")
      .attr("cursor","pointer")
      .attr("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
      })
      .attr("r", 5)
      .on('mouseover', function() {
        console.info("mouserover:", this);
        d3.select(this).transition()
          .duration(750)
          .attr("r", 7);
      })
      .on('mouseout', function(){
        console.info("mouseout:", this);
        d3.select(this).transition()
          .duration(750)
          .attr("r", 5);
      })
      .on('click', function (d) {
        self.circleClick(self, d.currentTarget.__data__.data);
      });

    // adds the text to the node
    node.append("text")
      .attr("dy", ".35em")
      .attr("x", function (d) { return d.children ? -13 : 13; })
      .style("text-anchor", function (d) {
        return d.children ? "end" : "start";
      })
      .text(function (d) { return d.data.name; })
      .on('click', function (d) { console.log("text:", d); });
  }
  mouseover() {
    console.info("mouserover:", this);
    d3.select(this).transition()
      .duration(750)
      .attr("r", 16);
  }

  mouseout() {
    console.info("mouseout:", this);
    d3.select(this).transition()
      .duration(750)
      .attr("r", 8);
  }
  nodeClick(d: any){
    console.info("node click", d);
  }
  circleClick(self: any, d: any): any {
    console.log("circleClick:", d);
    //if (d3.event.defaultPrevented) return; // click suppressed
    d = self.toggleChildren(d);
    self.updateTree(d);
  }

  // Toggle children function
  toggleChildren(d: any): any {
    console.log("toggleChildren:", d);
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else if (d._children) {
      d.children = d._children;
      d._children = null;
    }
    return d;
  }
}
