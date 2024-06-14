  document.addEventListener('DOMContentLoaded', () => {
  
    async function getHeatData() {
      const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
      try {
        let response = await fetch(url);
        let data = await response.json();
  
        console.log(data.monthlyVariance);
  
        const width = 1250;
        const height = 600;
        const padding = 80;
        const cellWidth = (width - 2 * padding) / 262; 
        const cellHeight = (height - 2 * padding) / 12; 
  
        const svg = d3.select('#heat-map-container')
                          .append('svg')
                          .attr('width', width)
                          .attr('height', height);
  
        const colors = [
          '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf',
          '#fee090', '#fdae61', '#f46d43', '#d73027'
        ];   
        
        const colorData = (temp) => {
          if (temp >= 2.8 && temp < 3.9) { return colors[0] }
          else if (temp >= 3.9 && temp < 5.0) { return colors[1] }
          else if (temp >= 5.0 && temp < 6.1) { return colors[2] }
          else if (temp >= 6.1 && temp < 7.2) { return colors[3] }
          else if (temp >= 7.2 && temp < 8.3) { return colors[4] }
          else if (temp >= 8.3 && temp < 9.5) { return colors[5] }
          else if (temp >= 9.5 && temp < 10.6) { return colors[6] }
          else if (temp >= 10.6 && temp < 11.7) { return colors[7] }
          else if (temp >= 11.7 && temp < 12.8) { return colors[8] }
        } 
  
        const convertMonth = (month) => {
          if (month === 1) { return 'January' }
          else if (month === 2) { return 'February' }
          else if (month === 3) { return 'March' }
          else if (month === 4) { return 'April' }
          else if (month === 5) { return 'May' }
          else if (month === 6) { return 'June' }
          else if (month === 7) { return 'July' }
          else if (month === 8) { return 'August' }
          else if (month === 9) { return 'September' }
          else if (month === 10) { return 'October' }
          else if (month === 11) { return 'November' }
          else if (month === 12) { return 'December' }
        }
  
        const baseTemp = data.baseTemperature;
  
        const minYear = d3.min(data.monthlyVariance, (d) => d.year);
        const maxYear = d3.max(data.monthlyVariance, (d) => d.year);
        
        const xScale = d3.scaleTime()
                         .domain([minYear, maxYear + 1])
                         .range([padding, width - padding]);
        
        const yScale = d3.scaleTime()
                         .domain([new Date(0, 0, 1), new Date(0, 11, 31)])
                         .range([padding, height - padding]);
  
        const xAxis = d3.axisBottom()
                        .tickFormat(d3.format('d'))
                        .scale(xScale);       
        
        const yAxis = d3.axisLeft()
                        .tickFormat(d3.timeFormat('%B'))
                        .scale(yScale);
                        
        svg.append('g')
               .attr('transform', 'translate(0, ' + (height - padding) + ')')
               .attr('id', 'x-axis')
               .call(xAxis);                 
  
        svg.append('g')
               .attr('transform', 'translate(' + padding + ', 0)')
               .attr('id', 'y-axis')
               .call(yAxis);  
        
        const vTitle = d3.select('#heat-map-container')
                        .append('p')
                        .attr('id', 'vTitle')
                        .text('Months');
        
        const hTitle = d3.select('#heat-map-container')
                        .append('p')
                        .attr('id', 'hTitle')
                        .text('Years');
  
        const tooltip = d3.select('#heat-map-container')
                          .append('div')
                          .attr('id', 'tooltip')
                          .style('opacity', 0); 
  
        const cells = svg.selectAll('.cell')
                             .data(data.monthlyVariance)
                             .enter()
                             .append('rect')
                             .attr('class', 'cell')
                             .attr('data-month', (d) => d.month - 1)
                             .attr('data-year', (d) => d.year)
                             .attr('data-temp', (d) => baseTemp + d.variance)
                             .attr('x', (d) => xScale(d.year))
                             .attr('y', (d) => padding + (d.month - 1) * ((height - 2 * padding) / 12)) 
                             .attr('width', cellWidth)
                             .attr('height', cellHeight)       
                             .style('fill', (d) => colorData(baseTemp + d.variance));   
  
        const mouseover = (event, d) => {
          const [x, y] = d3.pointer(event);
          tooltip
            .attr('data-year', d.year)
            .style('left', x + 'px')
            .style('top', (y - 50) + 'px')
            .style('opacity', 1);
          tooltip
            .html(
              convertMonth(d.month) + ' ' + d.year + '<br/>' + 
              'Temperature: ' + (baseTemp + d.variance).toFixed(1) + ' ºC' + '<br/>' +
              'Variance: ' + d.variance.toFixed(1) + ' ºC'
            );  
        }       
  
        const mouseout = () => {
          tooltip
            .style('opacity', 0);
        }
               
        cells.on('mouseover', mouseover)
             .on('mouseout', mouseout);       
               
        const legendData = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];
        const legendCellWidth = 40;
  
        const legend = svg.append('svg')
                              .attr('x', width - (padding + legendCellWidth * legendData.length))
                              .attr('y', height - 40)
                              .attr('width', legendCellWidth * legendData.length)
                              .attr('height', 100)
                              .attr('id', 'legend');
            
        legend.selectAll('.legend')
              .data(legendData)
              .enter()
              .append('rect')
              .attr('x', (d, i) => (legendCellWidth * i))
              .attr('y', 0)
              .attr('width', legendCellWidth)
              .attr('height', 10)
              .style('fill', (d) => colorData(d));
  
        legend.selectAll('.text')
              .data(legendData)
              .enter()
              .append('text')
              .text((d) => d.toString() + 'º')
              .attr('x', (d, i) => legendCellWidth * i)
              .attr('y', 25)
              .style('font-size', 12 + 'px')
  
      } catch(error) {
        console.log(error);
      }
    }
  
    getHeatData();
  
  });  
