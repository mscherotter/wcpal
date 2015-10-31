// title      : Watercolor Palette
// author     : Michael S. Scherotter
// license    : MIT License
// revision   : 0.001
// tags       : 
// file       : WatercolorPalette.jscad

// Generate a quarter-round used to radius the edges (4mm radius)
function corner() {
    return color("white", cube({ size: [4, 4, 140] })
     .translate([0, 0, 0])
     .subtract(cylinder({ r: 4, h: 140 }))
     .rotateY(90));
}

///create the pans to fit the half-pan watercolors
function pans(palette, yOffset, colorPans, width, edge, minimumDivideWidth) {
    var xOffset = edge;
    var panWidth = 16.2;
    var dividerWidth;
    do {
        dividerWidth = (width - (edge * 2) - (colorPans * panWidth)) / (colorPans - 1);
        if (dividerWidth < minimumDivideWidth) {
            colorPans--;
        }
    } while (dividerWidth < minimumDivideWidth);

    for (var i = 0; i < colorPans; i++) {
        var pan = cube({ size: [panWidth, 19, 6.2] }).translate([xOffset, yOffset, 9]);
        xOffset += panWidth + dividerWidth;
        palette = palette.subtract(pan);
    }

    return palette;
}

// create the vertical corners 
function corners(width, depth){
    return corner().rotateY(90).rotateZ(90).translate([4, 4, 20])
    	.union(corner().rotateY(90).translate([4, depth-4, 20]))
    	.union(corner().rotateY(90).rotateZ(180).translate([width-4, 4, 20]))
    	.union(corner().rotateY(90).rotateZ(-90).translate([width-4, depth-4, 20]));
}

// create the mixing pans that will be in the inside cover
function panArray(width, height, panWidth, panHeight){
	var columns = floor(width / (panWidth + 2));
	var rows = floor(height / (panHeight + 2));
	var columnSpacing = (width - (columns * panWidth)) / (columns - 1);
	var rowSpacing = (height - (rows * panHeight)) / (rows - 1);
	var solid = null;

	for (var row = 0; row < rows; row++){
		for (var column = 0; column < columns; column++){
			var pan = new cube({size:[panWidth, panHeight, 10]})
				.translate([column * (panWidth + columnSpacing), row * (panHeight + rowSpacing), 0]);
			
			if (solid === null){
				solid = pan;
			} else {
				solid = solid.union(pan);
			}		
		}
	}

	return solid;
}

// generate the lid
function generateLid(width, height, depth){

    var solid = color("white", cube({size:[width, height - 3, depth]})
        .subtract(cube({size:[width - 6, height - 5 - 2, depth]}).translate([3,2,3]))
		.subtract(panArray(width - 11, height - 12, 24.27, 15).translate([5,5,2]))
    	.union(generateHinge(width, 5, 4, 2, false).translate([0,-1,1 + depth / 2]))
		.subtract(generateHinge(width, 5, 4, 2, true).translate([0, -1, 1 + depth / 2])))
        .subtract(endCapLatches(height, 0, depth, 4))
	.translate([0, -height - 4, 0]);

	return solid.subtract(corners(width, height).translate([0, -height-7, 0]));
}

// Get the parameter definitions
function getParameterDefinitions() {
    return [
      { name: 'width', type: 'float', initial: 136, caption: "Width of the tray:" },
      { name: 'height', type: 'float', initial: 84, caption: "Height of the tray:" },
      { name: 'depth', type: 'float', initial: 15, caption: "Depth of the tray:" },
      { name: 'lidThickness', type: 'float', initial: 4, caption: "Lid thickness:"}
    ];
}

// main function
function main(params) {
    return generateBase(params.width, params.height, params.depth, 4, 4, 2, 7)
	.union(generateLid(params.width, params.height, params.lidThickness))
    .union(endCap(params.depth, params.height, params.lidThickness))
    .translate([-50,0,0]);
}

// Generate the hinge
function generateHinge(length, segments, outerDiameter, innerDiameter, isSolid)
{
	var segmentLength = length / segments;

	var solid = null;

	var start = isSolid ? 0 : segmentLength;
	 
	for (var i = start; i < length; i += (segmentLength * 2)) {
        var newSolid = cylinder({r: outerDiameter/2, h: segmentLength}).translate([0, 0, i]);

		if (solid == null) {
			solid = newSolid;
		} else {
			solid = solid.union(newSolid);
		}
	}

	var hole = cylinder({r:innerDiameter / 2, h:length});

	return color("white", solid.subtract(hole).rotateY(90));
}

/// generate the signature
function signature() {
    var text = vector_text(0, 0, "@Synergist 2015");
    var letters = [];
    text.forEach(function(polyline) {
        letters.push(rectangular_extrude(polyline, { w: 3, h: 3 }));
    });

    return union(letters).scale([0.25, 0.25, 0.25]);
}

function brushes(width) {
    var solids = [];

    solids.push(cylinder({ r: 6, h: width + 6 }).rotateY(90).translate([-10, 53, 7.5]));

    solids.push(cylinder({ r: 5, h: width + 6 }).rotateY(90).translate([-10, 40, 6.5]));

    solids.push(cylinder({ r: 4, h: width + 6 }).rotateY(90).translate([-10, 30, 5.5]));

    solids.push(cylinder({ r: 3, h: width + 6 }).rotateY(90).translate([-10, 22, 4.5]));

    return solids;
}

function endCapLatches(height, length, depth, lidHeight) {
    var solids = [];

    solids.push(cylinder({ r: 1, h: height }).rotateX(-90).translate([length + 4, 4, depth + lidHeight + 0.5]));
    solids.push(cylinder({ r: 1, h: height }).rotateX(-90).translate([length + 4, 4, - 0.5]));

    return union(solids);
}

function endCap(depth, height, lidHeight) {
    var length = 15;

    var solid = cube({ size: [length, height, depth + lidHeight + 4] }).translate([0, 0, -2])
        .union(cube({ size: [length + 5, height - 8, 2] }).translate([0, 4, depth + lidHeight]))
        .union(endCapLatches(height - 8, length, depth, lidHeight))
        .union(cube({ size: [length + 5, height - 8, 2] }).translate([0, 4, -2]))
        .subtract(union(brushes(40)).translate([20, 0, 0]))
        .subtract(corners(20, height).translate([0, 0, 20]))
        .subtract(corner().rotateX(-90).translate([0, 4, 2]))
        .subtract(corner().translate([0, height - 4, 2]))
        .subtract(corner().rotateZ(90).translate([4, 0, 2]))
        .subtract(corner().rotateX(180).translate([0, 4, depth + lidHeight - 2]))
        .subtract(corner().rotateX(90).translate([0, height - 4, depth + lidHeight - 2]))
        .subtract(corner().rotateZ(90).translate([4, 0, 2]))
        .subtract(corner().rotateZ(90).rotateY(90).translate([4, 0, depth + lidHeight - 2]))
        .subtract(color("blue", cube({size:[length, 15, depth]}).translate([2,2,2])))
        .subtract(color("blue", cube({ size: [length, 20, depth] }).translate([2, height-22, 2])))

        .rotateY(-90)
        .translate([-10, -height - 4, 0]);

    return solid;
}

// Generate the base of the palette
function generateBase(width, depth, height, edge, panCount, dividerWidth, colorPans) {
    var palette = cube({ size: [width, depth, height] })
        .subtract(brushes(width));

    palette = pans(palette, 4, colorPans, width, edge, dividerWidth);
    palette = pans(palette, depth - 25, colorPans, width, edge, dividerWidth);

    var panWidth = (width - (edge * 2) - (panCount - 1) * dividerWidth) / panCount; // 28.25;
    var offset = edge;
    for (var i = 0; i < panCount; i++) {
        var largePan = cube({ size: [panWidth, 39, 7] })
            .translate([offset, 27, 10])
            .rotateX(5);
        offset += panWidth + dividerWidth;
        palette = palette.subtract(largePan);
    }

    var mss = signature().rotateX(90);

    var mssLength = mss.getBounds()[1].x;

    var model = color("White", palette)
        .union(generateHinge(width, 5, 4, 2, true).translate([0, depth - 2, height + 1]))
        .subtract(generateHinge(width, 5, 4, 2, false).translate([0, depth - 2, height + 1]))
        .subtract(corner().rotateX(-90).translate([0, 4, 4]))
        .subtract(corner().translate([0, depth - 4, 4]))
        .subtract(corner().rotateZ(90).translate([4, 0, 4]))
        .subtract(corner().rotateZ(-90).translate([width - 4, depth, 4]))
        .union(mss.translate([width - mssLength - edge, 0.5, 5]))
        .subtract(endCapLatches(depth, 0, height, 4));

	return model.subtract(corners(width, depth));
}
