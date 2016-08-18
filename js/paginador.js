$.fn.dataTableExt.oApi.fnPagingInfo = function (oSettings) {     
  return {         "iStart": oSettings._iDisplayStart,
                   "iEnd": oSettings.fnDisplayEnd(),
                   "iLength": oSettings._iDisplayLength,
                   "iTotal": oSettings.fnRecordsTotal(),
                   "iFilteredTotal": oSettings.fnRecordsDisplay(),
                   "iPage": Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength),
                   "iTotalPages": Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength)     
                  }; };
 
 
 $.fn.dataTableExt.oApi.fnStandingRedraw = function(oSettings) {
    if(oSettings.oFeatures.bServerSide === false){
        var before = oSettings._iDisplayStart;
 
        oSettings.oApi._fnReDraw(oSettings);
 
        // iDisplayStart has been reset to zero - so lets change it back
        oSettings._iDisplayStart = before;
        oSettings.oApi._fnCalculateEnd(oSettings);
    }
      
    // draw the 'current' page
    oSettings.oApi._fnDraw(oSettings);
};


$.fn.dataTableExt.oPagination.links = {
    "fnInit": function ( oSettings, nPaging, fnCallbackDraw )
    {
      
        var nPrevious = document.createElement( 'a' );
        var nList = document.createElement( 'span' );
        var nNext = document.createElement( 'a' );
    
         
      
        nPrevious.innerHTML = oSettings.oLanguage.oPaginate.sPrevious;
        nNext.innerHTML = oSettings.oLanguage.oPaginate.sNext;
       
         
        var oClasses = oSettings.oClasses;
        
        nPrevious.className = oClasses.sPageButton+" "+oClasses.sPagePrevious;
        nNext.className= oClasses.sPageButton+" "+oClasses.sPageNext;
       
         
       
        nPaging.appendChild( nPrevious );
        nPaging.appendChild( nList );
        nPaging.appendChild( nNext );
       
         
      
         
        $(nPrevious).bind( 'click.DT', function() {
            if ( oSettings.oApi._fnPageChange( oSettings, "previous" ) )
            {
                fnCallbackDraw( oSettings );
            }
        } );
         
        $(nNext).bind( 'click.DT', function() {
            if ( oSettings.oApi._fnPageChange( oSettings, "next" ) )
            {
                fnCallbackDraw( oSettings );
            }
        } );
         
      
         
        /* Take the brutal approach to cancelling text selection */
        $('a', nPaging)
            .bind( 'mousedown.DT', function () { return false; } )
            .bind( 'selectstart.DT', function () { return false; } );
         
        /* ID the first elements only */
        if ( oSettings.sTableId !== '' && typeof oSettings.aanFeatures.p == "undefined" )
        {
            nPaging.setAttribute( 'id', oSettings.sTableId+'_paginate' );
           
            nPrevious.setAttribute( 'id', oSettings.sTableId+'_previous' );
            nNext.setAttribute( 'id', oSettings.sTableId+'_next' );
           
        }
    },
     
    "fnUpdate": function ( oSettings, fnCallbackDraw )
    {
        if ( !oSettings.aanFeatures.p )
        {
            return;
        }
         
        var iPageCount = $.fn.dataTableExt.oPagination.iFullNumbersShowPages;
        var iPageCountHalf = Math.floor(iPageCount / 2);
        var iPages = Math.ceil((oSettings.fnRecordsDisplay()) / oSettings._iDisplayLength);
        var iCurrentPage = Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength) + 1;
        var sList = "";
        var iStartButton, iEndButton, i, iLen;
        var oClasses = oSettings.oClasses;
         
        /* Pages calculation */
        if (iPages < iPageCount)
        {
            iStartButton = 1;
            iEndButton = iPages;
        }
        else
        {
            if (iCurrentPage <= iPageCountHalf)
            {
                iStartButton = 1;
                iEndButton = iPageCount;
            }
            else
            {
                if (iCurrentPage >= (iPages - iPageCountHalf))
                {
                    iStartButton = iPages - iPageCount + 1;
                    iEndButton = iPages;
                }
                else
                {
                    iStartButton = iCurrentPage - Math.ceil(iPageCount / 2) + 1;
                    iEndButton = iStartButton + iPageCount - 1;
                }
            }
        }
         
        /* Build the dynamic list */
        for ( i=iStartButton ; i<=iEndButton ; i++ )
        {
            if ( iCurrentPage != i )
            {
                sList += '<a class="'+oClasses.sPageButton+'">'+i+'</a>';
            }
            else
            {
                sList += '<a class="'+oClasses.sPageButtonActive+'">'+i+'</a>';
            }
        }
         
        /* Loop over each instance of the pager */
        var an = oSettings.aanFeatures.p;
        var anButtons, anStatic, nPaginateList;
        var fnClick = function(e) {
            /* Use the information in the element to jump to the required page */
            var iTarget = (this.innerHTML * 1) - 1;
            oSettings._iDisplayStart = iTarget * oSettings._iDisplayLength;
            fnCallbackDraw( oSettings );
            e.preventDefault();
        };
        var fnFalse = function () { return false; };
         
        for ( i=0, iLen=an.length ; i<iLen ; i++ )
        {
            if ( an[i].childNodes.length === 0 )
            {
                continue;
            }
             
            /* Build up the dynamic list forst - html and listeners */
            var qjPaginateList = $('span:eq(0)', an[i]);
            qjPaginateList.html( sList );
            $('a', qjPaginateList).bind( 'click.DT', fnClick ).bind( 'mousedown.DT', fnFalse )
                .bind( 'selectstart.DT', fnFalse );
             
            
        }
    }
};