import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.raw(`set search_path=invasivesbc;
  drop  view if exists invasivesbc.Activity_Observation_TerrestrialPlant_with_codes cascade;
  CREATE OR REPLACE VIEW Activity_Observation_TerrestrialPlant_with_codes as (
      select
      activity_id as activity_id,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_code')::text)) as invasive_plant_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_density_code')::text)) as invasive_plant_density_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'invasive_plant_distribution_code')::text)) as invasive_plant_distribution_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'soil_texture_code')::text)) as soil_texture_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'specific_use_code')::text)) as specific_use_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'slope_code')::text)) as slope_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'aspect_code')::text)) as aspect_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'proposed_treatment_code')::text)) as proposed_treatment_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'range_unit_number')::text)) as range_unit_number,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'plant_life_stage_code')::text)) as plant_life_stage_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'plant_health_code')::text)) as plant_health_code,
      trim('"' from((activity_payload::json->'form_data'->'activity_subtype_data'->'plant_seed_stage_code')::text)) as plant_seed_stage_code,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'flowering')::text::boolean as flowering,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'legacy_site_ind')::text::boolean as legacy_site_ind,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'early_detection_rapid_resp_ind')::text::boolean as early_detection_rapid_resp_ind,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'research_detection_ind')::text::boolean as research_detection_ind,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'well_ind')::text::boolean as well_ind,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'special_care_ind')::text::boolean as special_care_ind,
      (activity_payload::json->'form_data'->'activity_subtype_data'->'biological_ind')::text::boolean as biological_ind


      from activity_incoming_data
      where activity_incoming_data.activity_type = 'Observation'
      and activity_incoming_data.activity_subtype = 'Activity_Observation_PlantTerrestial'
      and deleted_timestamp is null
      )
    COMMENT ON VIEW Activity_Observation_TerrestrialPlant_with_codes IS 'View on terrestrial plant observation specific fields, with raw code table values';
  `);
}

export async function down(knex: Knex): Promise<void> {
  knex.raw(`drop view if exists invasivesbc.Activity_Observation_TerrestrialPlant_with_codes`);
}
