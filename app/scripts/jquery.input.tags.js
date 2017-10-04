// jQuery Input Tag v.1.0.0
// https://github.com/Papacidero/jquery.input.tag/

(function($) {

  $.fn.jQueryInputTags = function(options) {

		if (options.prepareTag) {
			options.prepareTag = window[options.prepareTag] || function () {};
		}

    let consoleColors = {
      success: 'color: #5fba7d;  font-weight: bold',
      error: 'color: #f74f57; font-weight: bold',
      warning: 'color: #f69c55; font-weight: bold'
    };

    let defaults = {
      maxTotalSize: 255,
      maxTagSize: 255,
      minTagSize: 1,
      chars: /[:,]/,
      keycode: /(^9$|^13$)/, // Tab, Enter, Space
      separator: ',',
      sensitive: false,
      clearSpaces: true
    };

    let tagClasses = [];

    var options = $.extend({}, defaults, options);

    var actions = {

      init: () => {
        actions.handlers(); // Start Handlers
        actions.populate(this, true);
      },

      display: (targetInput) => {
        $(targetInput).find('.tag').remove(); // Clean Tags

        if (actions.getTagList(targetInput).length) {
          actions.getTagList(targetInput).forEach((item, index) => { // Create Tags
          var tagClass = tagClasses[index] || '';
          var tag = $(`<div class="tag ${tagClass}" data-tag-value="${item}">${item}<div class="delete" data-tag-value="${item}">+</div></div>`);
          options.prepareTag(tag, item, index);
            $(targetInput).append(tag);
          });
        }
      },

      // Add and Delete Tag
      addTag: (targetInput, value) => {

        if (options.clearSpaces) value = value.replace(/^\s+/, '').replace(/\s+/g, ' ');

        $(targetInput).find('input[type="text"]').val('');
        actions.updateTagList(targetInput, value);
      },
      deleteTag: (targetInput, targetTag) => {
        let tagList = actions.getTagList(targetInput);

        if (tagList.length) {
          if (targetTag === 'last') {
            tagList.pop();
            console.log(`%c${targetTag} Tag Deleted`, consoleColors.error);
          } else {
            console.log(`%c${tagList[targetTag]} Tag Deleted`, consoleColors.error);
            tagList.splice(targetTag, 1);
          }

          $(targetInput).find('input[type="hidden"]').val(tagList = tagList.toString());
          $(targetInput).find('.tag').remove();
          actions.populate(targetInput);
        }

        delete(tagClasses[targetTag]);
      },

      // Set tag class
      addTagClass: (targetInput, targetTag, cssClass) => {
        if (tag && cssClass) {
          tagClasses[targetTag] += ' ' + cssClass;
          console.log(`%c${tagList[targetTag]} Tag Css Class '${cssClass}' Added`, consoleColors.success);
        }
      },

      // List Items Manipulation
      updateTagList: (targetInput, value) => {

        var actualValue = new Set($(targetInput).find('input[type="hidden"]').val().split(options.separator));
        if (options.sensitive === false) var unsensitiveActualValue = new Set($(targetInput).find('input[type="hidden"]').val().toLowerCase().split(options.separator));

        if (actualValue.has('')) actualValue.delete('');

        value.split(options.chars).forEach((item, index) => {
          if (item.length >= options.minTagSize && item.length <= options.maxTagSize) {

            // Check if is duplicated
            if (options.sensitive === false && unsensitiveActualValue.has(item.toLowerCase())) {
              console.log(`%c${item} tag already exists`, consoleColors.warning);
            } else if (actualValue.has(item)) {
              console.log(`%c${item} tag already exists`, consoleColors.warning);
            } else {
              actualValue.add(item);
              console.log(`%c${item} Tag Added`, consoleColors.success);
            }

            //Check if MaxLenght has reachead
            if ([...actualValue].toString().length >= options.maxTotalSize) {
              console.log(`%cMax chars limit of ${options.maxTotalSize} reached, total text size is ${[...actualValue].toString().length}`, consoleColors.error);
              actualValue.delete(item);
            }

          }
        });
        $(targetInput).find('input[type="hidden"]').val([...actualValue].toString()).trigger('change');
      },
      getTagList: (targetInput) => {
    	  var tagList = $(targetInput).find('input[type="hidden"]').val().length ? $(targetInput).find('input[type="hidden"]').val().split(`${options.separator}`) : [];
        return tagList;
      },

      // Populate List
      populate: (targetInput, init) => {
        $(targetInput).each(function(index, el) {
          console.log(`%cIs Populating... ${el.className}`, consoleColors.warning);
          var hidden = $(el).find('input[type="hidden"]');
          if (!init || hidden.val().length) {
            hidden.trigger('change');
          }
        });
      },

      // Event Handlers
      handlers: () => {
        $(this).on('keyup keydown focusout', (e) => {
          var value = e.target.value;

          // Add new Tag
          if (((options.keycode.test(e.keyCode) || options.chars.test(value) || e.type === 'focusout') && value.length >= options.minTagSize) || value.length >= options.maxTagSize) {
            actions.addTag(e.currentTarget, value);
          }

          // Prevent tab from changing filters if not adding a new tag
          if (e.keyCode === 9 && value.length >= 1) {
           e.preventDefault();
         }
        });
        $(this).on('keydown', (e) => {
          var value = e.target.value;

          // Remove Tag
          if (e.keyCode === 8 && value.length === 0) {
            actions.deleteTag(e.currentTarget, 'last');
          }
        });
        $(this).on('click', (e) => {
          if ($(e.target).hasClass('delete')) {
            actions.deleteTag(e.currentTarget, $(e.target).parent('.tag').index() - 2);
          }
        });
        $(this).on('change', '[type="hidden"]', (e) => {
          $(this).trigger("tagUpdated.jQueryInputTags", [actions.getTagList(this)]);
          actions.display(this);
        });
        $(this).on('update.jQueryInputTags', (e) => {
          actions.display(this);
        });
        $(this).on("tagRemove.jQueryInputTags", (e, item) => {
          actions.deleteTag(this, item);
          actions.display(this);
        });
        $(this).on("tagAddClass.jQueryInputTags", (e, item, cssClass) => {
          actions.addTagClass(this, item, cssClass);
          actions.display(this);
        });
      }
    };

    actions.init();

  };

})(jQuery);
