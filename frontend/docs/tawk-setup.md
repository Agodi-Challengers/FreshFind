# Tawk.to chat setup

FreshFind uses [Tawk.to](https://www.tawk.to) as its chatbot platform (SRS 1.8). The site hides the default Tawk bubble and opens the chat from its own **Ask FreshFind** button, so the widget matches the design.

## 1. Connect the widget

1. Create a free Tawk.to account and a property for FreshFind.
2. Go to **Administration → Chat Widget** and copy the embed link: `https://embed.tawk.to/<PROPERTY_ID>/<WIDGET_ID>`.
3. In `frontend/.env` add:

   ```
   VITE_TAWK_PROPERTY_ID=<PROPERTY_ID>
   VITE_TAWK_WIDGET_ID=<WIDGET_ID>
   ```

4. Restart `npm run dev` (Vite reads `.env` at start-up).

## 2. Match the design

In **Administration → Chat Widget → Widget Appearance**:

- Theme colour: `#1F4D2B` (FreshFind green), text colour white.
- Widget title: `FreshFind Assistant`, status line: `Answers instantly`.

## 3. Pre-scripted answers (SRS: static dataset, links to market and produce pages)

Use **Shortcuts** (and, if you enable it, the AI Assist knowledge base) with these questions and answers. Replace the domain with the live site address.

| Question | Answer |
|---|---|
| What’s in season? | See this month’s picks: /seasonal · Full guide: /produce |
| Which markets are open now? | Live list of open markets: /find?open=1 |
| Which markets open this Saturday? | /find?day=sat |
| Do markets take bank transfers? | Most markets take cash and bank transfer. Markets that also take card: /directory?feat=card |
| Is there parking? | Markets with dedicated parking: /directory?feat=parking |
| Where can I buy fresh fish? | /directory?cat=Fish%20%26%20meat · Festac 2nd Avenue: /markets/festac-2nd-ave · Epe Fish & Farm: /markets/epe-fish-farm |
| Where can I buy tomatoes? | /produce/tomatoes |
| Organic produce? | Markets with organic growers: /directory?feat=organic |
| Evening markets after work? | /directory?time=evening |
| How do I list my market? | Send us the details: /contact?topic=add |

Quick replies to enable on the welcome message: **What’s in season?**, **Markets open now**, **Do they take transfers?**, **Parking info** (as in the Figma chatbot frame).


<!--Start of Tawk.to Script-->
<script type="text/javascript">
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/6ab7af89b7335734433eac22/1k3eobcaf';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
</script>
<!--End of Tawk.to Script-->