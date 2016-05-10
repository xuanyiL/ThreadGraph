var renderer = function() {
  var that = this,
      focus, 
      brusho,
      node1,
      node2, 
      countByDate = {},
      dateByIndex = {}, 
      valueByIndex = {},
      index = 0,
      forcedSim = 0,
      nodes = [],
      labelAnchors = [],
      labelAnchorLinks = [],
      titleAnchors = [], 
      titleAnchorLinks = [],
      link, 
      linkedByIndex = {}, 
      force2, 
      force3,
      anchorNode, 
      anchorLin, 
      titleNode, 
      titleLink, 
      svg = null, 
      halfSqDim = 3.5, 
      marker = null, 
      xGraphScale, 
      yCurr, 
      xBase, 
      yBase, 
      yBrush, 
      zoom,
      xAxis, 
      yAxis, 
      xTimelineScale, 
      context;
  
  function timeFormat(formats) {
    return function(date) {
      var i = formats.length - 1, f = formats[i];
      while (!f[1](date)) f = formats[--i];
      return f[0](date);
    };
  }
  
  /// Custom time scale format
  var customTimeFormat = timeFormat(
      [
         [d3.time.format("%Y"), function() { return true; }],
         [d3.time.format("%b %Y"), function(d) { return d.getMonth(); }],
         [d3.time.format("%b %d"), function(d) { return d.getDate() != 1; }],
         [d3.time.format("%a %d"), function(d) { return d.getDay() && d.getDate() != 1; }]
  ]);

  var customTimeFormat2 = timeFormat(
      [
         [d3.time.format("%Y"), function() { return true; }],
         [d3.time.format("%b %Y"), function(d) { return d.getMonth(); }],
         [d3.time.format("%b %d"), function(d) { return d.getDate() != 1; }],
         //[d3.time.format("%a %d"), function(d) { return d.getDay() && d.getDate() != 1; }]
  ]);

  function brushstart() {
    svg.classed("selecting", true);
  }

  function brushend() {
    svg.classed("selecting", !d3.event.target.empty());
  }

  function brushmove() {
    var e = d3.event.target.extent();
    node1.classed("selected", function(d) {
      return (e[0][0] <= d.date && d.date <= e[1][0]);
    });
    node1.classed("mnode", function(d) {
        return (e[0][0] > d.date || d.date > e[1][0]);
    });

    brush();
  }

  function listProperties(obj) {
     var propList = "";
     for(var propName in obj) {
        if(typeof(obj[propName]) != "undefined") {
           propList += (propName + ", ");
        }
     }
  }

  function brush() {
    brusho = d3.event.target;

    // Set the domain of x and y (scale domain)
    xGraphScale.domain(brusho.empty() ? xBase.domain() : [brusho.extent()[0][0], brusho.extent()[1][0]]);
    xBase.nice();
    xGraphScale.nice();
    yCurr.domain(brusho.empty() ? yBase.domain() : [brusho.extent()[0][1], brusho.extent()[1][1]]);
    yFocus.domain(brusho.empty() ? yBase.domain() : [brusho.extent()[0][1], brusho.extent()[1][1]]);
   
    recomputePositions();

    // Start the simulation again because it will trigger the tick event which
    // will re-evaluate the label positions
    forcedSim = 1;
    force.start();
  }

  function draw() {
      // if (brusho != null) {
      //   d3.select(".brush").call(brusho.clear());
      // }
      recomputePositions();
      forcedSim = 1;
      force.start();
  }

  function recomputeLinksPositions(selector) {
    if (selector === null || selector === undefined) {
      return;
    }

    focus.selectAll(selector).attr("d", function(d) {
      var sourceX =  xGraphScale(dateByIndex[d.source.index]), 
      sourceY = yFocus(valueByIndex[d.source.index]), 
      targetX = xGraphScale(dateByIndex[d.target.index]),
      targetY = yFocus(valueByIndex[d.target.index]);

      var dx = targetX - sourceX,
          dy = targetY - sourceY,
          dr = Math.sqrt(dx * dx + dy * dy)*5;
          if (d.type === 'buildons') {
            //console.log('buildons ', d);
            return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
          } else {
            //console.log('references ', d);
            return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,0 " + targetX + "," + targetY;
          }
    });
  }

  function recomputePositions() {
    recomputeLinksPositions("path.link-buildons");
    recomputeLinksPositions("path.link-references");  

    // console.log(focus.selectAll("rect.mnode"));

    // Re-evaluate the center of nodes in this new domain
    focus.selectAll("rect.mnode").attr("x", function(d) { return (xGraphScale(d.date) - halfSqDim); });
    focus.selectAll("rect.mnode").attr("y", function(d) { return (yFocus(d.ran) - halfSqDim); });

    focus.selectAll("rect.selected").attr("x", function(d) { return (xGraphScale(d.date) - halfSqDim); });
    focus.selectAll("rect.selected").attr("y", function(d) { return (yFocus(d.ran) - halfSqDim); });

    // Kind of same of the tick labels
    //focus.select(".x.axis").call(xAxis);
  }
  
  

  function isConnected(a, b) {
      return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
  }

  function fade(opacity) {
    return function(d) {
        node1.style("stroke-opacity", function(o) {
            thisOpacity = isConnected(d, o) ? 1 : opacity;
            this.setAttribute('fill-opacity', thisOpacity); 
            return thisOpacity;
        });

        link.style("opacity", opacity).style("opacity", function(o) {
            return o.source === d || o.target === d ? 1 : 0.6 * opacity;
        });

        anchorNode.style("opacity", function(o) {
          thisOpacity = isConnected(d, o.node) ? 1 : opacity;
          this.setAttribute('opacity', thisOpacity);
          return thisOpacity;
        });    
    };
  }

  function markNodeSelected(select) {
    node1.classed("selected", false);
    d3.select(this).classed("selected", true);
    
    if (select === true) {
      selectGraphItem(this.getAttribute("noteid"));
      highlightstate();
    }

    var event = jQuery.Event("selected");
    event.d = this;
    $("body").trigger(event); 
  }

  function updateLink() {
    this.attr("x1", function(d) {
      return d.source.x;
    }).attr("y1", function(d) {
      return d.source.y;
    }).attr("x2", function(d) {
      return d.target.x;
    }).attr("y2", function(d) {
      return d.target.y;
    });
  }
  
  function adjustTextLabels(selection) {
    selection.selectAll('.tick text')
        .attr('transform', 'translate(' + 14 + ',0)');
  }

  function updateNode() {
    this.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  function updateTimeline() {
    context.select(".x.axis").call(xAxis).call(adjustTextLabels);
    updateMap(xTimelineScale);
  }
  
  /** public api */
  return {
    drawTimeline : function(data, div, timeRange) { 
      if (timeRange[0] === timeRange[1]) {
        throw "timeRange has invalid range. Start and end time are same";
      }
      
      var width = $(div).width(), 
          height =  $(div).height() * 0.9, 
          bottomMargin = $(div).height() * 0.68,
          bottomSceneBottom = $(div).height()*0.33,
          xOffset = width * 0.01;

      xBase = d3.time.scale().range([0 + xOffset, width - xOffset]);
      yBase = d3.scale.linear().range([height * 0.9, height * 0.1]);
      
      xBase.domain(timeRange);
      xBase.nice();
      yBase.domain([0, 0.9]);

      xTimelineScale = d3.time.scale().range([0 + xOffset, width - xOffset]);
      xTimelineScale.domain(timeRange);
      xTimelineScale.nice();
      
      svg = d3.select(div).append("svg")
        .attr("width", width * 1.1) // Setting width to 1.1 times width so that we avoid cutting text
        .attr("height", height);
      
      // Not used right now
      // context = svg.append("g")
      //   .attr("transform", "translate(" + 0 + "," + 0 + ")");

      context = svg.append("g")
        .attr("transform", "translate(" + 0 + "," + 0 + ")");

      xAxis = d3.svg.axis().scale(xTimelineScale).orient("bottom");
      xAxis.tickFormat(customTimeFormat);
      
      xAxis2 = d3.svg.axis().scale(xBase).orient("top");
      xAxis2.tickFormat(customTimeFormat2);
      
      zoom = d3.behavior.zoom()
        .on("zoom", updateTimeline);

      zoom.x(xTimelineScale).scaleExtent([0.99, 10]);

      context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + 0 + "," + bottomMargin + ")")
        .call(xAxis)
        .call(adjustTextLabels);  
      
      context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + bottomSceneBottom + ")")
      .call(xAxis2)
      .call(adjustTextLabels);  
      

      context.append("rect")
        .attr("width", "100%")
        .attr("height", "40%")
        .attr("class", "pane")
        .call(zoom); 
      
      // context.append("g")
      //   .attr("class", "brush")
      //   .call(d3.svg.brush().x(xbase).y(ybase)
      //   .on("brushstart", brushstart)
      //   .on("brush", brushmove)
      //   .on("brushend", brushend));
    },
    drawGraph : function(data, div, timeRange) {
      if (div === null || div === undefined) {
        console.log("Read data requires valid div object");
        return;
      }

      /// View parameters
      var totalWidth = $(div).width() ,
          totalHeight = $(div).height(),  
          margin = {top: totalHeight * 0.01, right: 0,
                    bottom: totalHeight * 0.01, left: 0,
                    offset: totalWidth * 0.01},
          margin2 = {top: 0, right: 0,
                     bottom: totalHeight * 0.08, left: 0},
          topViewHeight = totalHeight * 0.80,
          width = totalWidth - margin.left - margin.right,
          topSceneHeight = totalHeight - margin.top - margin.bottom,
          topSceneBottom = topViewHeight - margin.bottom,
          bottomSceneBottom = totalHeight - topViewHeight - margin2.bottom,
          bottomSceneHeight = totalHeight - topViewHeight - margin2.bottom - margin2.top;

      /// Some other necessary parameters
      var parseDate = d3.time.format("%b %Y").parse;
      var xOffset = totalWidth * 0.01;

      /// X, Y scale
      xGraphScale = d3.time.scale().range([0 + xOffset, width - xOffset]);
      xBase = d3.time.scale().range([0 + xOffset, width - xOffset]);
      yCurr = d3.scale.linear().range([topSceneBottom - margin.offset, margin.top]);
      yBase = d3.scale.linear().range([topSceneBottom - margin.offset, margin.top]);
      yFocus = d3.scale.linear().range([topSceneBottom - margin.offset, margin.top]);
      yBrush = d3.scale.linear().range([bottomSceneBottom, margin2.top]);

      var yBar = d3.scale.linear()
          .range([bottomSceneHeight, margin2.top]);

      //xAxis = d3.svg.axis().scale(xGraphScale).orient("bottom");
      // xAxis2 = d3.svg.axis().scale(xBase).orient("bottom");
      //yAxis = d3.svg.axis().scale(yCurr).orient("left");

      // zoom = d3.behavior.zoom()
      //   .on("zoom", draw);
        
      force = d3.layout.force()
                .size([width, topSceneHeight]);
      
      svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", topSceneHeight + margin.top + margin.bottom);

      marker = svg.append("svg:defs").selectAll("marker")
        .data(["buildons", "references"])
      .enter().append("svg:marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
      .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");  
      
      focus = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
      force
        .nodes(data.nodes)
        .links(data.links)
        .start();

      data.nodes.forEach(function(d) {
        d.date = d.time;
        var dateObj = new Date(d.date);
        var newDate = dateObj.getUTCFullYear() + "/" + dateObj.getUTCMonth() +
          + "/" + dateObj.getUTCDate();
        d.value = 0;
        d.ran = Math.random() * 0.8;

        if (countByDate.hasOwnProperty(newDate)) {
          countByDate[newDate] += 1;
          d.value = countByDate[newDate];
        } else {
          countByDate[newDate] = 1;
          d.value = countByDate[newDate];
        }

        dateByIndex[index] = d.date;

        /// Fill in data for author lables
        labelAnchors.push({
          node : d,
          label : d.author,
          value : d.value,
          ran: d.ran,
          date: d.date
        });
        labelAnchors.push({
          node : d,
          label : d.author,
          value : d.value,
          ran: d.ran,
          date: d.date
        });
        labelAnchors.push({
          node : d,
          label : d.id,
          value : d.value,
          ran: d.ran,
          date: d.date
        });
        
        labelAnchorLinks.push({
          source : (index) * 3,
          target : (index * 3 + 1),
          weight : 1
        });
        
        labelAnchorLinks.push({
          source : (index) * 3,
          target : (index * 3 + 2),
          weight : 1
        });

        index += 1;
      });
      
      /// Fill up value by index
      index = 0;
      data.nodes.forEach(function(d) {
        valueByIndex[index++] = d.ran;
      });

      data.links.forEach(function(d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
      });

      /// Define domains for scales
      //var domain = d3.extent(data.nodes.map(function(d) { return d.date; }));
      var domain = d3.extent(timeRange);
      
      if (domain[0] === domain[1]) {
        domain[1] = 1.001 * domain[0];
      }
      
      xGraphScale.domain(domain);
      xGraphScale.nice();
      yBase.domain([0, 0.9]);
      yCurr.domain(yBase.domain());
      yFocus.domain([0, 0.9]);
      yBrush.domain([0, 0.9]);

      xBase.domain(xGraphScale.domain());
      xBase.nice();
      xGraphScale.nice();
      yBar.domain([0, d3.max(data.nodes, function(d) { return d.value; })]);

      force2 = d3.layout.force()
                 .nodes(labelAnchors)
                 .links(labelAnchorLinks)
                 .gravity(0)
                 .linkDistance(12)
                 .linkStrength(8)
                 .charge(-100)
                 .size([width, topSceneHeight]);
      force2.start();
      
      anchorLink = focus.selectAll("line.anchorLink")
        .data(labelAnchorLinks);

      /// Create label nodes
      anchorNode = focus.selectAll("g.anchorNode")
        .data(force2.nodes())
        .enter()
        .append("svg:g")
        .attr("class", "anchorNode");

      anchorNode.append("svg:circle")
        .attr("r", 4);

      anchorNode.append("svg:text")
        .attr("class", function(d, i) {
          return i % 3 === 1 ? "anchorText" : "titleText";
          })
        .attr("text-anchor", "start")
        .text(function(d, i) {
          return i % 3 == 0 ? "" : d.label;
        });

      /// Create title label nodes
      titleLink = focus.selectAll("line.titleLink")
        .data(titleAnchorLinks);

      /// Create links
      link = focus.selectAll("path.links")
        .data(data.links)
        .enter().append("svg:path")
          .attr("class", function(d) { return "links link-" + d.type; })
          .style("stroke-width", function(d) { return 1.2; })
          .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

      link.attr("d", function(d) {
        var sourceX =  xGraphScale(dateByIndex[d.source.index]);
        var sourceY = yBase(valueByIndex[d.source.index]); 
        var targetX = xGraphScale(dateByIndex[d.target.index]);
        var targetY = yBase(valueByIndex[d.target.index]);

        var dx = targetX - sourceX,
          dy = targetY - sourceY,
          dr = Math.sqrt(dx * dx + dy * dy)*5;
        return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
      });

      node1 = focus.selectAll("rect.mnode")
              .data(data.nodes)
                .enter().append("svg:rect")
                  .attr("noteid", function(d) { return d.noteid; })
                  .attr("class","mnode")
                  .attr("width", 2 * halfSqDim)
                  .attr("height", 2 * halfSqDim)
                  .attr("x", function(d){ return (xGraphScale(d.date) - halfSqDim); })
                  .attr("y", function(d){ return (yBase(d.ran) - halfSqDim); })
                  .on("mouseover", fade(.1)).on("mouseout", fade(1))
                  .on('click', markNodeSelected);

      // focus.append("g")
      //   .attr("class", "x axis")
      //   .attr("transform", "translate(0," + topSceneBottom + ")")
      //   .call(xAxis);
      
      // zoom.x(xGraphScale);

      /// On tick event start the simulation for anchor nodes
      force.on("tick", function() {

        // link.attr("x1", function(d) { return xGraphScale(dateByIndex[d.source.index]); })
        //     .attr("y1", function(d) { return yBase(valueByIndex[d.source.index]); })
        //     .attr("x2", function(d) { return xGraphScale(dateByIndex[d.target.index]); })
        //     .attr("y2", function(d) { return yBase(valueByIndex[d.target.index]); });

        force2.start();
        
        anchorNode.each(function(d, i) {
          if (this.childNodes === undefined || this.childNodes === null ||
              this.childNodes === "") {
            console.log('child nodes are undefined');
            return;
          }
          
          /// forcedSim is ON when we brush context view 
          if(i % 3 === 0) {
            d.x = xGraphScale(d.node.date);
            if (forcedSim === 1) {
              d.y = yFocus(d.node.ran);
            } else {
              d.y = yBase(d.node.ran);
            }

          } else {
            var b = this.childNodes[1].getBBox();
            
            var delX, delY;
            
            /// forcedSim is ON when we brush context view
            if (forcedSim === 1) {
              delY = yFocus(d.node.ran);
            } else {
              delY = yBase(d.node.ran);       
            }
            
            delX= xGraphScale(d.node.date);
            
            var diffX = d.x - delX;
            var diffY = d.y - delY;

            var dist = Math.sqrt(diffX * diffX + diffY * diffY);

            var shiftX = b.width * (diffX - dist) / (dist * 2);
            shiftX = Math.max(-b.width, Math.min(0, shiftX));
            var shiftY = 5; 
            
            /// Update both the circle and the text
            //this.childNodes[0].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
            this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
          }
        });

        anchorNode.call(updateNode);
        anchorLink.call(updateLink);
      });
    },
    toggleAuthors : function(elem) {
      // Need to do more but for now just toggle
      var anchorTexts = svg.selectAll(".anchorText");
      var currentState = anchorTexts.style("display");
      if (currentState !== "none") {
        anchorTexts.style("display", "none");
        if (elem === null || elem === undefined) {
          return;
        }
        
        elem.innerHTML = 'Show Author';
      }
      else {
        anchorTexts.style("display", "");
        if (elem === null || elem === undefined) {
          return;
        }
        elem.innerHTML = 'Hide Author';
      }
      
      draw();
    },
    toggleTitles: function(elem) {
      // Need to do more but for now just toggle
      var titleTexts = svg.selectAll(".titleText");
      var currentState = titleTexts.style("display");

      if (currentState !== "none") {
        titleTexts.style("display", "none");
        if (elem === null || elem === undefined) {
          return;
        }
        
        elem.innerHTML = 'Show Title';
      }
      else {
        titleTexts.style("display", "");
        if (elem === null || elem === undefined) {
          return;
        }
        elem.innerHTML = 'Hide Title';
      }
    },
    toggleHighlightNodes: function() {
      return;
    },
    toggleSelectNode: function(item) {
      if (item === null) {
        return;
      }
      
      var selectedNodes = d3.selectAll(".mnode").filter(function(d, i) { return (d.noteid === item.getAttribute("noteid")); });
      if ( selectedNodes !== null && selectedNodes.length === 1 && selectedNodes !== "") {
        if ((selectedNodes).classed("selected")) {
          (selectedNodes).classed("selected", false); 
        }
        else {
          d3.selectAll(".selected").classed("selected", false);
          (selectedNodes).classed("selected", true);
        }
      }
    },
    toggleHighlightNode: function(item) {
      if (item === null) {
        return;
      }
      
      var selectedNodes = d3.selectAll(".mnode").filter(function(d, i) { return (d.noteid === item.getAttribute("noteid")); });
      if ( selectedNodes !== null && selectedNodes.length === 1 && selectedNodes !== "") {
        
        if ((selectedNodes).classed("highlighted")) {
          (selectedNodes).classed("highlighted", false);
        }
        else {
          //d3.selectAll(".highlighted").classed("highlighted", false);
          (selectedNodes).classed("highlighted", true);
          console.log('remove highlightx z');
        }
      }
    },
    toggleLinks: function(elem, type) {
      console.log('toggle links ', type);
      // Need to do more but for now just toggle
      var selector = null;
      if (type === null || type === undefined) {
        return;
      } else {
        selector = "path.link-" + type;
      }

      var links = focus.selectAll(selector);
      if (links === null || links.empty()) {
        return;
      }

      var currentState = links.style("display");
      // console.log('current state value is ', currentState);
      // console.log('current state is ', currentState === 'none');
      if (currentState !== "none") {
        links.style("display", "none");
        if (elem === null || elem === undefined) {
          return;
        }
        
        if (type === 'buildons') {
          $(elem).html('Show Build-on');
        } else {
          $(elem).html('Show Reference');
        }
      }
      else {
        // console.log("Ok setting the display to not none");  
        links.style("display", "inline");
        if (elem === null || elem === undefined) {
          return;
        }
        if (type === 'buildons') {
          $(elem).html('Hide Build-on');
        } else {
          $(elem).html('Hide Reference');
        }
      }
      
      //draw();
    },
    redraw: function() {
      draw();
    },
    updateView: function(xScale, yScale) {
      if (xScale !== null || xScale !== undefined) {
        xGraphScale = xScale;
      }
      if (yScale !== null || y !== undefined) {
        yCurr = yScale;
      }
    },
    updateZoomExtents: function(extents) {
      if (xGraphScale) {
        // Set the domain of x and y (scale domain)
        xGraphScale.domain(extents);
        //xGraphScale.nice();
        recomputePositions();
  
        // Start the simulation again because it will trigger the tick event which
        // will re-evaluate the label positions
        forcedSim = 1;
        force.start();
      } else if (xTimelineScale) {
        xTimelineScale.domain(extents);
        //xTimelineScale.nice();
        updateTimeline();
      }
    },
    resetGraphView: function() {
      if (xGraphScale) {
        xGraphScale.domain([$("#slider").slider("option", "min"), $("#slider").slider("option", "max")]);
        //xGraphScale.nice();
        draw();
      } else if (xTimelineScale) {
        xTimelineScale.domain([$("#slider").slider("option", "min"), $("#slider").slider("option", "max")]);
        //xTimelineScale.nice();
        updateTimeline();
      }
    },
    select: function(obj) {
      var noteid = d3.select(obj).attr('noteid');
      var matchedNodes = node1.filter(function(d, i) { return d.noteid === noteid; } );
      node1.classed('selected', false);
      matchedNodes.each(function() {
        d3.select(this).classed("selected", true);
      });
    }
  }
};


