define(function() {
	return function creatTabs() {
	 	// Tabs
	 	$('.phytoplankton-tabs > li').each(function(i) {
	 		$(this).attr('data-tab', 'tab-' + (i+1));
	 	});

	 	$('.phytoplankton-tabs ~ pre').each(function(i) {
	 		$(this).attr('id', 'tab-' + (i+1));
	 	});

	 	$('.phytoplankton-tabs + pre').addClass('is-active');

	 	$('.phytoplankton-tabs__item').click(function() {
	 		var tab_id = $(this).attr('data-tab');

	 		$('.phytoplankton-tabs li').removeClass('is-active');
	 		$('.phytoplankton-tabs ~ pre').removeClass('is-active');

	 		$(this).addClass('is-active');
	 		$("#"+tab_id).addClass('is-active');
	 	});
	}
});