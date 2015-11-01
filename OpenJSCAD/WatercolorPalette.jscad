// title      : Watercolor Palette
// author     : Michael S. Scherotter
// license    : MIT License
// revision   : 0.004
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
function pans(palette, yOffset, colorPans, width, edge, minimumDivideWidth, panWidth, panDepth, baseDepth) {
    var xOffset = edge;

    var dividerWidth;
    do {
        dividerWidth = (width - (edge * 2) - (colorPans * panWidth)) / (colorPans - 1);
        if (dividerWidth < minimumDivideWidth) {
            colorPans--;
        }
    } while (dividerWidth < minimumDivideWidth);

    var panHeight = 10;

    for (var i = 0; i < colorPans; i++) {
        var pan = cube({ size: [panWidth, panDepth, panHeight] }).translate([xOffset, yOffset, baseDepth - 9]);
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

function cornerSupport() {
    return color("blue", cylinder({ r:5, h:1}).translate([0,0,0]));
}

function cornerSupports(width, depth) {
    var supports = [];

    supports.push(cornerSupport());
    supports.push(cornerSupport().translate([width, 0]));
    supports.push(cornerSupport().translate([width, depth]));
    supports.push(cornerSupport().translate([0, depth]));

    return union(supports);
}

// generate the lid
function generateLid(width, height, depth, pinSize, flangeLength, hingeDiameter, params) {

    var solid = color("white", cube({ size: [width, height - 0.5, depth] })
            .subtract(cube({ size: [width - 6, height - 4 - 2, depth] }).translate([3, 2, 5]))
            .subtract(panArray(width - 11, height - 12, 24.27, 15).translate([5, 5, 4]))
            .subtract(generateBottomCorners(width, height))
            .union(generateHinge(width - 8, 5, hingeDiameter, pinSize, false).translate([4, 0.5, 2 + depth / 2]))
            .subtract(generateHinge(width - 8, 5, hingeDiameter, pinSize, true).translate([4, 0.5, 2 + depth / 2])))
        .subtract(cylinder({ r: 0.01 + pinSize / 2, h: width }).rotateY(90).translate([0, 0.5, 2 + depth / 2]))
        .subtract(endCapLatches(height, 0, depth, 4, flangeLength))
        .subtract(corners(width, height - 0.5));

    if (params.addCornerSupports == 1) {
        solid = solid.union(cornerSupports(width, height));
    }

    return solid.translate([0, -height - 12, 0]);
}

// Get the parameter definitions
function getParameterDefinitions() {
    return [
      { name: 'width', type: 'float', initial: 126, caption: "Width of the tray:" },
      { name: 'height', type: 'float', initial: 84, caption: "Height of the tray:" },
      { name: 'depth', type: 'float', initial: 17, caption: "Depth of the tray:" },
      { name: 'lidThickness', type: 'float', initial: 6, caption: "Lid thickness:" },
      { name: "hingeDiameter", type: "float", initial: 6, caption: "Hinge diameter:"},
      { name: 'pinDiameter', type: 'float', initial: 2.5, caption: "Hinge pin diameter:" },
      { name: 'flangeLength', type: 'float', initial: 8, caption: "Flange length:" },
      { name: "addCornerSupports", type: "choice", initial: 1, values: [1, 0], caption:"Add corner supports:", captions: ["Yes", "No"]}
    ];
}

// main function
function main(params) {
    return generateBase(params.width, params.height, params.depth, 4, 4, 1, 7, params.pinDiameter, params.lidThickness, params.flangeLength, params.hingeDiameter, params)
	.union(generateLid(params.width, params.height - 1, params.lidThickness, params.pinDiameter, params.flangeLength, params.hingeDiameter, params))
    .union(endCap(params.depth, params.height, params.lidThickness, params.flangeLength))
    .rotateZ(90)
    .translate([20, -50, 0]);
}

// Generate the hinge
function generateHinge(length, segments, outerDiameter, innerDiameter, isSolid)
{
	var segmentLength = length / segments;

	var solid = null;

	var start = isSolid ? 0 : segmentLength;
	 
	for (var i = start; i < length; i += (segmentLength * 2)) {
        var newSolid = cylinder({r: outerDiameter/2, h: segmentLength}).translate([0, 0, i]);

		if (solid === null) {
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

function brushes() {
    var solids = [];

    var spacing = 2;

    solids.push(cylinder({ r: 7, h:132 }).rotateY(90).translate([0, 52, 6]));

    solids.push(cylinder({ r: 6, h:127 }).rotateY(90).translate([0, 38, 5]));

    solids.push(cylinder({ r: 4, h: 122 }).rotateY(90).translate([0, 27, 3]));

    solids.push(cylinder({ r: 3.5, h: 122 }).rotateY(90).translate([0, 18.5, 2.5]));

    return union(solids).translate([-10, 1, 2]);
}

function endCapLatches(height, length, depth, lidHeight, flangeLength) {
    var solids = [];
    var latchRadius = 2;

    solids.push(cylinder({ r: latchRadius, h: height }).rotateX(-90).translate([length + flangeLength, 4, depth + lidHeight]));
    solids.push(cylinder({ r: latchRadius, h: height }).rotateX(-90).translate([length + flangeLength, 4, 0]));

    return union(solids);
}

function endCap(depth, height, lidHeight, flangeLength) {
    var length = 14;

    var solid = color("white", cube({ size: [length, height, depth + lidHeight + 5] })).translate([0, 0, -2])
        .union(color("white", cube({ size: [length + flangeLength, height - 8, 2] }).translate([0, 4, depth + lidHeight + 1])))
        .union(color("white", endCapLatches(height - 8, length, depth + 1, lidHeight, flangeLength)))
        .union(color("white", cube({ size: [length + flangeLength, height - 8, 2] }).translate([0, 4, -2])))
        .subtract(brushes().translate([14, 0, 0]))
        .subtract(corners(20, height).translate([0, 0, 20]))
        .subtract(corner().rotateX(-90).translate([0, 4, 2]))
        .subtract(corner().translate([0, height - 4, 2]))
        .subtract(corner().rotateZ(90).translate([4, 0, 2]))
        .subtract(corner().rotateX(180).translate([0, 4, depth + lidHeight - 1]))
        .subtract(corner().rotateX(90).translate([0, height - 4, depth + lidHeight - 1]))
        .subtract(corner().rotateZ(90).translate([4, 0, 2]))
        .subtract(corner().rotateZ(90).rotateY(90).translate([4, 0, depth + lidHeight -1]))
        .subtract(color("blue", cube({size:[length, 12, depth]}).translate([2,2,2])))
        .subtract(color("blue", cube({ size: [length, 20, depth] }).translate([2, height-22, 2])))

        .rotateY(-90)
        .rotateZ(-90)
        .translate([30, height + 8, 0]);

    return solid;
}

function generateBottomCorners(width, depth) {
    var solid = [];

    solid.push(corner().rotateX(-90).translate([0, 4, 4]));
    solid.push(corner().translate([0, depth - 4, 4]));
    solid.push(corner().rotateZ(90).translate([4, 0, 4]));
    solid.push(corner().rotateZ(-90).translate([width - 4, depth, 4]));

    return union(solid);
}

// Generate the base of the palette
function generateBase(width, depth, height, edge, panCount, dividerWidth, colorPans, pinSize,
    lidHeight, flangeLength, hingeDiameter, params) {
    var palette = cube({ size: [width, depth, height] })
        .subtract(brushes());

    var panWidth = 15.7;
    var panDepth =19;
    palette = pans(palette, 4, colorPans, width, edge, dividerWidth, panWidth, panDepth, height);
    palette = pans(palette, depth - panDepth - edge, colorPans, width, edge, dividerWidth, panWidth, panDepth, height);

    var panWidth = (width - (edge * 2) - (panCount - 1) * dividerWidth) / panCount; // 28.25;
    var offset = edge;
    for (var i = 0; i < panCount; i++) {
        var largePan = cube({ size: [panWidth, depth - (panDepth * 2) - (edge * 4), 7] })
            .translate([offset, 27, 10])
            .rotateX(6);
        offset += panWidth + dividerWidth;
        palette = palette.subtract(largePan);
    }

    var mss = signature().rotateX(90);

    var mssLength = mss.getBounds()[1].x;

    var hingeOffset = depth;

    var shape = color("White", palette)
        .union(generateHinge(width - 8, 5, hingeDiameter, pinSize, true).translate([4, hingeOffset, height + 1]))
        .subtract(generateHinge(width - 8, 5, hingeDiameter, pinSize, false).translate([4, hingeOffset, height + 1]))
        .subtract(color("Gray", cylinder({ r: 0.01 + pinSize / 2, h: width }).rotateY(90).translate([3, hingeOffset, height + 1])))
        .subtract(generateBottomCorners(width, depth))
        .union(mss.translate([width - mssLength - edge, 0.5, 5]))
        .subtract(endCapLatches(depth, 0, height, lidHeight, flangeLength))
        .subtract(corners(width, depth));

    if (params.addCornerSupports == 1) {
        return shape.union(cornerSupports(width, depth));
    }

    return shape;
}
