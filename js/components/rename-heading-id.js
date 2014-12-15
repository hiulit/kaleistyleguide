define(function() {
	return function renameHeadingID(tag, that, array, index) {
		var nameID = that.attr(tag);
			if(array.lastIndexOf(nameID) !== -1) {
				nameID = that.attr(tag, nameID + index);
				array.push(nameID);
			} else {
				array.push(nameID);
			}
		}
	}
});