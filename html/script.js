QBClothing = {};

var selectedTab = '.characterTab';
var lastCategory = 'character';
var selectedCam = null;
var hasTracker = false;
var canChange = true;
var over_button = new Audio('https://origennetwork.com/music/v7/over.wav?2');
var click = new Audio('https://origennetwork.com/music/v7/click.mp3?2');
over_button.volume = 0.1;
click.volume = 0.1;

var clothingCategorys = [];
var blacklist = [];

$(
	'.b-button,.clothing-menu-option-item-left, .clothing-menu-option-item-right, .clothing-menu-header-btn, .clothing-menu-header-camera-btn, .clothing-menu-option-button, .change-camera-button, .clothing-menu-myOutfit-option-button, .clothing-menu-myOutfit-option-button-remove'
).mouseenter(function () {
	over_button.currentTime = '0';
	over_button.play();
});

$(
	'.b-button, .clothing-menu-option-button, .clothing-menu-myOutfit-option-button-remove'
).click(function () {
	click.currentTime = '0';
	click.play();
});

$(document).on('click', '.clothing-menu-header-btn', function (e) {
	var category = $(this).data('category');

	$(selectedTab).removeClass('selected');
	$(this).addClass('selected');
	$('.clothing-menu-' + lastCategory + '-container').css({ display: 'none' });

	lastCategory = category;
	selectedTab = this;
	$('.clothing-menu-' + category + '-container').css({ display: 'block' });
});

QBClothing.ResetItemTexture = function (obj, category) {
	var itemTexture = $(obj).parent().parent().find('[data-type="texture"]');
	var defaultTextureValue = clothingCategorys[category].defaultTexture;
	$(itemTexture).val(defaultTextureValue);
	$.post(
		'https://qb-clothing/updateSkin',
		JSON.stringify({
			clothingType: category,
			articleNumber: defaultTextureValue,
			type: 'texture'
		})
	);
};

$(document).on('click', '.clothing-menu-option-item-right', function (e) {
	e.preventDefault();

	var clothingCategory = $(this).parent().parent().data('type');
	var buttonType = $(this).data('type');
	var inputElem = $(this).parent().find('input');
	var inputVal = $(inputElem).val();
	var newValue = parseFloat(inputVal) + 1;

	var lowerLimit = $(inputElem).hasClass('allow-negative') ? -1 : 0;
	var lowerLimitFace = $(inputElem).hasClass('allow-negative-face') ? -30 : 0;
	var currentLowerLimit = lowerLimitFace == -30 ? lowerLimitFace : lowerLimit;

	if (canChange) {
		if (hasTracker && clothingCategory == 'accessory') {
			$.post('https://qb-clothing/TrackerError');
			return;
		} else {
			if (clothingCategory == 'model') {
				$(inputElem).val(newValue);
				$.post(
					'https://qb-clothing/setCurrentPed',
					JSON.stringify({ ped: newValue }),
					function (model) {
						$('#current-model').html('<p>' + model + '</p>');
					}
				);
				canChange = true;
				QBClothing.ResetValues();
			} else {
				if (buttonType == 'item') {
					var buttonMax = $(this)
						.parent()
						.find('[data-headertype="item-header"]')
						.data('maxItem');
					if (clothingCategory == 'accessory' && newValue == 13) {
						newValue = 14;
					}
					if (newValue > parseInt(buttonMax)) {
						newValue = currentLowerLimit;
					}
					$(inputElem).val(newValue);
					if(blacklist[clothingCategory] != null && blacklist[clothingCategory].includes(newValue)){
						while(blacklist[clothingCategory].includes(newValue) && newValue < parseInt(buttonMax)){
							newValue = newValue + 1;
						}
						$(inputElem).val(newValue);
						$.post(
							'https://qb-clothing/updateSkin',
							JSON.stringify({
								clothingType: clothingCategory,
								articleNumber: newValue,
								type: buttonType
							})
						);
						QBClothing.ResetItemTexture(this, clothingCategory);
					} else {
						$.post(
							'https://qb-clothing/updateSkin',
							JSON.stringify({
								clothingType: clothingCategory,
								articleNumber: newValue,
								type: buttonType
							})
						);
						QBClothing.ResetItemTexture(this, clothingCategory);
					}
				} else {
					var buttonMax = $(this)
						.parent()
						.find('[data-headertype="texture-header"]')
						.data('maxTexture');
					if (newValue > parseInt(buttonMax)) {
						newValue = currentLowerLimit;
					}
					$(inputElem).val(newValue);
					$.post(
						'https://qb-clothing/updateSkin',
						JSON.stringify({
							clothingType: clothingCategory,
							articleNumber: newValue,
							type: buttonType
						})
					);
				}
			}
		}
	}
});

$('input[type="number"]:not(.allow-negative)').on('input', function () {
	var value = parseFloat($(this).val());
	if (value < 0) {
		$(this).val(0);
	}
});

$('input[type="number"].allow-negative').on('input', function () {
	var value = parseFloat($(this).val());
	if (value < -1) {
		$(this).val(-1);
	}
});

$(document).on('click', '.clothing-menu-option-item-left', function (e) {
	e.preventDefault();

	var clothingCategory = $(this).parent().parent().data('type');
	var buttonType = $(this).data('type');
	var inputElem = $(this).parent().find('input');
	var inputVal = $(inputElem).val();
	var newValue = parseFloat(inputVal) - 1;

	var lowerLimit = $(inputElem).hasClass('allow-negative') ? -1 : 0;
	var lowerLimitFace = $(inputElem).hasClass('allow-negative-face') ? -30 : 0;
	var currentLowerLimit = lowerLimitFace == -30 ? lowerLimitFace : lowerLimit;

	if (newValue < currentLowerLimit) {
		if (buttonType == 'item') {
			var buttonMax = $(this)
				.parent()
				.find('[data-headertype="item-header"]')
				.data('maxItem');
			newValue = parseInt(buttonMax);
		} else {
			var buttonMax = $(this)
				.parent()
				.find('[data-headertype="texture-header"]')
				.data('maxTexture');
			newValue = parseInt(buttonMax);
		}
	}

	if (canChange) {
		if (hasTracker && clothingCategory == 'accessory') {
			$.post('https://qb-clothing/TrackerError');
			return;
		} else {
			if (clothingCategory == 'model') {
				if (newValue != 0) {
					$(inputElem).val(newValue);
					$.post(
						'https://qb-clothing/setCurrentPed',
						JSON.stringify({ ped: newValue }),
						function (model) {
							$('#current-model').html('<p>' + model + '</p>');
						}
					);
					canChange = true;
					QBClothing.ResetValues();
				}
			} else {
				if (buttonType == 'item') {
					var buttonMax = $(this)
						.parent()
						.find('[data-headertype="item-header"]')
						.data('maxItem');
					if (newValue < currentLowerLimit) {
						newValue = parseInt(buttonMax); // Set input value to the last item when below the lower limit
					}
					if (clothingCategory == 'accessory' && newValue == 13) {
						newValue = 12;
					}
					$(inputElem).val(newValue);
					if(blacklist[clothingCategory] != null && blacklist[clothingCategory].includes(newValue)){
						while(blacklist[clothingCategory].includes(newValue) && newValue < parseInt(buttonMax)){
							newValue = newValue - 1;
						}
						$(inputElem).val(newValue);
						$.post(
							'https://qb-clothing/updateSkin',
							JSON.stringify({
								clothingType: clothingCategory,
								articleNumber: newValue,
								type: buttonType
							})
						);
						QBClothing.ResetItemTexture(this, clothingCategory);
					} else {
						$.post(
							'https://qb-clothing/updateSkin',
							JSON.stringify({
								clothingType: clothingCategory,
								articleNumber: newValue,
								type: buttonType
							})
						);
						QBClothing.ResetItemTexture(this, clothingCategory);
					}
				} else {
					var buttonMax = $(this)
						.parent()
						.find('[data-headertype="texture-header"]')
						.data('maxTexture');
					if (newValue < currentLowerLimit) {
						newValue = parseInt(buttonMax);
					}
					$(inputElem).val(newValue);
					$.post(
						'https://qb-clothing/updateSkin',
						JSON.stringify({
							clothingType: clothingCategory,
							articleNumber: newValue,
							type: buttonType
						})
					);
				}
			}
		}
	}
});

var changingCat = null;

function ChangeUp() {
	var clothingCategory = $(changingCat).parent().parent().data('type');
	var buttonType = $(changingCat).data('type');
	var inputVal = parseFloat($(changingCat).val());

	if (clothingCategory == 'accessory' && inputVal + 1 == 13) {
		$(changingCat).val(14 - 1);
	}
}

function ChangeDown() {
	var clothingCategory = $(changingCat).parent().parent().data('type');
	var buttonType = $(changingCat).data('type');
	var inputVal = parseFloat($(changingCat).val());

	if (clothingCategory == 'accessory' && inputVal - 1 == 13) {
		$(changingCat).val(12 + 1);
	}
}

$(document).on('change', '.item-number', function () {
	var clothingCategory = $(this).parent().parent().data('type');
	var buttonType = $(this).data('type');
	var inputVal = $(this).val();

	changingCat = this;

	if (hasTracker && clothingCategory == 'accessory') {
		$.post('https://qb-clothing/TrackerError');
		$(this).val(13);
		return;
	} else {
		if (clothingCategory == 'accessory' && inputVal == 13) {
			$(this).val(12);
			return;
		} else {
			if(blacklist[clothingCategory] != null && blacklist[clothingCategory].includes(parseInt(inputVal))) return;

			$.post(
				'https://qb-clothing/updateSkinOnInput',
				JSON.stringify({
					clothingType: clothingCategory,
					articleNumber: parseFloat(inputVal),
					type: buttonType
				})
			);
		}
	}
});

$(document).on('click', '.clothing-menu-header-camera-btn', function (e) {
	e.preventDefault();

	var camValue = parseFloat($(this).data('value'));

	if (selectedCam == null) {
		$(this).addClass('selected-cam');
		$.post(
			'https://qb-clothing/setupCam',
			JSON.stringify({
				value: camValue
			})
		);
		selectedCam = this;
	} else {
		if (selectedCam == this) {
			$(selectedCam).removeClass('selected-cam');
			$.post(
				'https://qb-clothing/setupCam',
				JSON.stringify({
					value: 0
				})
			);

			selectedCam = null;
		} else {
			$(selectedCam).removeClass('selected-cam');
			$(this).addClass('selected-cam');
			$.post(
				'https://qb-clothing/setupCam',
				JSON.stringify({
					value: camValue
				})
			);

			selectedCam = this;
		}
	}
});

$(document).on('keydown', function () {
	switch (event.keyCode) {
		case 88: // X
			$.post('https://qb-clothing/handsUp');
			break;
		case 38: // UP
			ChangeUp();
			break;
		case 40: // DOWN
			ChangeDown();
			break;
	}
});

$(document).on('wheel', function (event) {
	if ($('.clothing-menu-container:hover').length) return;
	if (event.originalEvent.deltaY < 0) {
		$.post('https://qb-clothing/rotateRight');
	} else if (event.originalEvent.deltaY > 0) {
		$.post('https://qb-clothing/rotateLeft');
	}
});

QBClothing.ToggleChange = function (bool) {
	canChange = bool;
};

$(document).ready(function () {
	window.addEventListener('message', function (event) {
		switch (event.data.action) {
			case 'open':
				QBClothing.Open(event.data);
				break;
			case 'close':
				QBClothing.Close();
				break;
			case 'updateMax':
				QBClothing.SetMaxValues(event.data.maxValues);
				break;
			case 'reloadMyOutfits':
				QBClothing.ReloadOutfits(event.data.outfits);
				break;
			case 'toggleChange':
				QBClothing.ToggleChange(event.data.allow);
				break;
			case 'ResetValues':
				QBClothing.ResetValues();
				break;
			case 'saveOutfitName':
				$.post(
					'https://qb-clothing/saveOutfit',
					JSON.stringify({
						outfitName: event.data.nameOutfit
					})
				);

				$('.clothing-menu-container').removeClass('hide');

				break;
			case 'backShop':
				$('.clothing-menu-container').removeClass('hide');
				break;
			case 'setBlacklist':
				blacklist = event.data.list;
				break;
		}
	});
});

QBClothing.ReloadOutfits = function (outfits) {
	$('.clothing-menu-myOutfits-container').html('');
	$.each(outfits, function (index, outfit) {
		var elem =
			'<div style="animation-delay:' +
			index * 100 +
			'ms;"  class="clothing-menu-option" data-myOutfit="' +
			(index + 1) +
			'"> <div class="clothing-menu-option-header"><p>' +
			outfit.outfitname +
			'</p></div><div class="clothing-menu-myOutfit-option-button"><i class="fas fa-check"></i> <span>Vestir</span></div><div class="clothing-menu-myOutfit-option-button-remove"><i class="fas fa-trash"></i> <span>Eliminar</span></div></div>';
		$('.clothing-menu-myOutfits-container').append(elem);

		$("[data-myOutfit='" + (index + 1) + "']").data('myOutfitData', outfit);
	});
};

$(document).on('click', '#save-menu', function (e) {
	e.preventDefault();
	$.post('https://qb-clothing/saveClothing');
	QBClothing.Close();
	$('.ayuda2').fadeOut(300);
});

$(document).on('click', '#cancel-menu', function (e) {
	e.preventDefault();
	QBClothing.Close();
	$.post('https://qb-clothing/resetOutfit');
	$('.ayuda2').fadeOut(300);
});

QBClothing.SetCurrentValues = function (clothingValues) {
	$.each(clothingValues, function (i, item) {
		var itemCats = $('.clothing-menu-container').find('[data-type="' + i + '"]');
		var input = $(itemCats).find('input[data-type="item"]');
		var texture = $(itemCats).find('input[data-type="texture"]');

		$(input).val(item.item);
		$(texture).val(item.texture);

		var $colours = $(itemCats).find('.colours');

		if ($colours.html() != undefined) {
			var $texture = $colours.find(
				'[data-type="texture"][value="' + item.texture + '"]'
			);
			var $texture2 = $colours.find(
				'[data-type="texture2"][value="' + item.texture2 + '"]'
			);

			if ($texture.html() != undefined) {
				$texture.addClass('selected');
			}

			if ($texture2.html() != undefined) {
				$texture2.addClass('selected');
			}
		}

		var $slider = $(itemCats).find('.rangevalue');
		var $sliderbar = $(itemCats).find('.sliderselector');

		if ($slider.html() != undefined) {
			$slider.find('p').html(item[$sliderbar.attr('data-type')]);
			$sliderbar.val(item[$sliderbar.attr('data-type')]);
		}
	});
};

QBClothing.Open = function (data) {
	clothingCategorys = data.currentClothing;

	if (data.hasTracker) {
		hasTracker = true;
	} else {
		hasTracker = false;
	}

	$('.change-camera-buttons').fadeIn(150);

	$('.clothing-menu-roomOutfits-container').css('display', 'none');
	$('.clothing-menu-myOutfits-container').css('display', 'none');
	$('.clothing-menu-character-container').css('display', 'none');
	$('.clothing-menu-clothing-container').css('display', 'none');
	$('.clothing-menu-accessoires-container').css('display', 'none');
	$('.clothing-menu-container').removeClass('hide').show();

	$('.clothing-menu-header').html('');
	QBClothing.SetCurrentValues(data.currentClothing);
	$('.clothing-menu-roomOutfits-container').html('');
	$('.clothing-menu-myOutfits-container').html('');

	$('#save-outfit').show();
	$.each(data.menus, function (i, menu) {
		if (menu.selected) {
			$('.clothing-menu-header').append(
				'<div class="clothing-menu-header-btn ' +
					menu.menu +
					'Tab selected" data-category="' +
					menu.menu +
					'"><p>' +
					menu.label +
					'</p></div>'
			);
			$('.clothing-menu-' + menu.menu + '-container').css({ display: 'block' });
			selectedTab = '.' + menu.menu + 'Tab';
			lastCategory = menu.menu;
		} else {
			$('.clothing-menu-header').append(
				'<div class="clothing-menu-header-btn ' +
					menu.menu +
					'Tab" data-category="' +
					menu.menu +
					'"><p>' +
					menu.label +
					'</p></div>'
			);
		}

		if (menu.menu == 'roomOutfits') {
			$.each(menu.outfits, function (index, outfit) {
				var elem =
					'<div style="animation-delay:' +
					index * 100 +
					'ms;" class="clothing-menu-option" data-outfit="' +
					(index + 1) +
					'"> <div class="clothing-menu-option-header"><p>' +
					outfit.outfitLabel +
					'</p></div> <div class="clothing-menu-outfit-option-button"><p><i class="fas fa-check"></i> <span>Vestir</span></p></div> </div>';
				$('.clothing-menu-roomOutfits-container').append(elem);

				$("[data-outfit='" + (index + 1) + "']").data('outfitData', outfit);
			});
		}

		if (menu.menu == 'myOutfits') {
			$.each(menu.outfits, function (index, outfit) {
				var elem =
					'<div style="animation-delay:' +
					index * 100 +
					'ms;" class="clothing-menu-option" data-myOutfit="' +
					(index + 1) +
					'"> <div class="clothing-menu-option-header"><p>' +
					outfit.outfitname +
					'</p></div><div class="clothing-menu-myOutfit-option-button"><i class="fas fa-check"></i> <span>Vestir</span></div><div class="clothing-menu-myOutfit-option-button-remove"><i class="fas fa-trash"></i> <span>Eliminar</span></div></div>';
				$('.clothing-menu-myOutfits-container').append(elem);

				$("[data-myOutfit='" + (index + 1) + "']").data('myOutfitData', outfit);
			});
		}

		if (!menu.creador) {
			$('.zona-cara').hide();
		} else if (menu.creador || menu.creador == undefined) {
			$('.zona-cara').show();
			$('.ayuda2').fadeIn(300);
			$('#save-outfit').hide();
		}

		if (menu.label == 'Peluquería') {
			$(
				'#z_ojos, #pecas, #nariz, #altura-nariz, #long-nariz, #alt-hueso-nariz, #pico-nariz, #g-pico-nariz, #ancho-mandibula, #long-mandibula, #ancho-mejillas, #apertura-ojos, #anchura-labios, #anchura-mandibula, #long-mandibula, #altura-barbilla, #long-barbilla, #ancho-barbilla, #menton, #anchura-cuello, #arrugas'
			).hide();
		} else {
			$(
				'#z_ojos, #pecas, #nariz, #altura-nariz, #long-nariz, #alt-hueso-nariz, #pico-nariz, #g-pico-nariz, #ancho-mandibula, #long-mandibula, #ancho-mejillas, #apertura-ojos, #anchura-labios, #anchura-mandibula, #long-mandibula, #altura-barbilla, #long-barbilla, #ancho-barbilla, #menton, #anchura-cuello, #arrugas'
			).show();
		}
	});

	var menuWidth = 100 / data.menus.length;

	$('.clothing-menu-header-btn').css('width', menuWidth + '%');
};

$(document).on('click', '.clothing-menu-outfit-option-button', function (e) {
	e.preventDefault();

	var oData = $(this).parent().data('outfitData');

	$.post(
		'https://qb-clothing/selectOutfit',
		JSON.stringify({
			outfitData: oData.outfitData,
			outfitName: oData.outfitLabel
		})
	);
});

$(document).on('click', '.clothing-menu-myOutfit-option-button', function (e) {
	e.preventDefault();

	var outfitData = $(this).parent().data('myOutfitData');

	$.post(
		'https://qb-clothing/selectOutfit',
		JSON.stringify({
			outfitData: outfitData.skin,
			outfitName: outfitData.outfitname,
			outfitId: outfitData.outfitId
		})
	);
});

$(document).on('click', '.clothing-menu-myOutfit-option-button-remove', function (e) {
	e.preventDefault();

	var outfitData = $(this).parent().data('myOutfitData');

	$.post(
		'https://qb-clothing/removeOutfit',
		JSON.stringify({
			outfitData: outfitData.skin,
			outfitName: outfitData.outfitname,
			outfitId: outfitData.outfitId
		})
	);
});

QBClothing.Close = function () {
	$.post('https://qb-clothing/close');
	$('.change-camera-buttons').fadeOut(150);
	$('.clothing-menu-roomOutfits-container').css('display', 'none');
	$('.clothing-menu-myOutfits-container').css('display', 'none');
	$('.clothing-menu-character-container').css('display', 'none');
	$('.clothing-menu-clothing-container').css('display', 'none');
	$('.clothing-menu-accessoires-container').css('display', 'none');
	$('.clothing-menu-header').html('');

	$(selectedCam).removeClass('selected-cam');
	$(selectedTab).removeClass('selected');
	selectedCam = null;
	selectedTab = null;
	lastCategory = null;
	$('.clothing-menu-container').addClass('hide');
};

QBClothing.SetMaxValues = function (maxValues) {
	$.each(maxValues, function (i, cat) {
		if (cat.type == 'character') {
			var containers = $('.clothing-menu-character-container').find(
				'[data-type="' + i + '"]'
			);
			var itemMax = $(containers).find('[data-headertype="item-header"]');
			var headerMax = $(containers).find('[data-headertype="texture-header"]');

			$(itemMax).data('maxItem', maxValues[containers.data('type')].item);
			$(headerMax).data('maxTexture', maxValues[containers.data('type')].texture);

			$(itemMax).html(
				'<p>' + maxValues[containers.data('type')].item + ' Elementos</p>'
			);
			$(headerMax).html(
				'<p>' + maxValues[containers.data('type')].texture + ' Texturas</p>'
			);
		} else if (cat.type == 'hair') {
			var containers = $('.clothing-menu-clothing-container').find(
				'[data-type="' + i + '"]'
			);
			var itemMax = $(containers).find('[data-headertype="item-header"]');
			var headerMax = $(containers).find('[data-headertype="texture-header"]');

			$(itemMax).data('maxItem', maxValues[containers.data('type')].item);
			$(headerMax).data('maxTexture', maxValues[containers.data('type')].texture);

			$(itemMax).html(
				'<p>' + maxValues[containers.data('type')].item + ' Elementos</p>'
			);
			$(headerMax).html(
				'<p>' + maxValues[containers.data('type')].texture + ' Texturas</p>'
			);
		} else if (cat.type == 'accessoires') {
			var containers = $('.clothing-menu-accessoires-container').find(
				'[data-type="' + i + '"]'
			);
			var itemMax = $(containers).find('[data-headertype="item-header"]');
			var headerMax = $(containers).find('[data-headertype="texture-header"]');

			$(itemMax).data('maxItem', maxValues[containers.data('type')].item);
			$(headerMax).data('maxTexture', maxValues[containers.data('type')].texture);

			$(itemMax).html(
				'<p>' + maxValues[containers.data('type')].item + ' Elementos</p>'
			);
			$(headerMax).html(
				'<p>' + maxValues[containers.data('type')].texture + ' Texturas</p>'
			);
		}
	});
};

QBClothing.ResetValues = function () {
	$.each(clothingCategorys, function (i, cat) {
		var itemCats = $('.clothing-menu-container').find('[data-type="' + i + '"]');
		var input = $(itemCats).find('input[data-type="item"]');
		var texture = $(itemCats).find('input[data-type="texture"]');

		$(input).val(cat.defaultItem);
		$(texture).val(cat.defaultTexture);
	});
};

$(document).on('click', '#save-outfit', function (e) {
	e.preventDefault();

	$('.clothing-menu-container').addClass('hide');

	//$(".clothing-menu-save-outfit-name").fadeIn(150);
	$.post('https://qb-clothing/loadOutfitName');
});

/*$(document).on('click', '#save-outfit-save', function(e){
    e.preventDefault();

   $(".clothing-menu-container").css({"display":"block"}).animate({right: 0,}, 200);
    $(".clothing-menu-save-outfit-name").fadeOut(150);

    $.post('https://qb-clothing/saveOutfit', JSON.stringify({
        outfitName: $("#outfit-name").val()
    }));
});*/

$(document).on('click', '#cancel-outfit-save', function (e) {
	e.preventDefault();

	$('.clothing-menu-container').css({ display: 'block' }).animate({ right: 0 }, 200);
	//$(".clothing-menu-save-outfit-name").fadeOut(150);
});

$(document).on('click', '.change-camera-button', function (e) {
	e.preventDefault();

	var rotationType = $(this).data('rotation');

	$.post(
		'https://qb-clothing/rotateCam',
		JSON.stringify({
			type: rotationType
		})
	);
});

// QBClothing.Open()

$('.colour').on('click', function (e) {
	e.preventDefault();
	var category = $(this).parent().parent().attr('data-type');
	$(this).parent().find('.selected').removeClass('selected');
	$(this).addClass('selected');
	$.post(
		'https://qb-clothing/updateSkin',
		JSON.stringify({
			clothingType: category,
			articleNumber: $(this).attr('value'),
			type: $(this).attr('data-type')
		})
	);
});

function sliderselector(crr) {
	var $crr = $(crr);
	var category = $crr.parent().attr('data-type');

	$crr.parent().find('.rangevalue').find('p').html($crr.val());
	$.post(
		'https://qb-clothing/updateSkin',
		JSON.stringify({
			clothingType: category,
			articleNumber: $crr.val(),
			type: $crr.attr('data-type')
		})
	);
}
