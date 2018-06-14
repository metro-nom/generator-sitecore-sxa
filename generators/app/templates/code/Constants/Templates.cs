using Sitecore.Data;

namespace <%=featureNamespace%>.Constants
{
    public static class Templates
    {
        public static class <%=featureName%>
        {
            /// <summary>
            ///     The template identifier string
            /// </summary>
            public const string TemplateIdString = "{<%=templateGuid%>}";

            /// <summary>
            ///     The template name
            /// </summary>
            public const string TemplateName = nameof(<%=featureName%>);

            /// <summary>
            ///     The template identifier
            /// </summary>
            public static readonly ID TemplateId = new ID(TemplateIdString);

            public static class Fields
            {
            }
        }
    }
}

