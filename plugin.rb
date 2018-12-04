# name: vitalerte/vitastats
# about: Private plugin for Vitalliance's statistics
# version: 0.1
# authors: Tchowski
# url: tchowski

register_asset "stylesheets/vitalerte.scss"

enabled_site_setting :vitalerte_enabled

add_admin_route "vitalerte_plugin.title", "vitalerte"
PLUGIN_NAME ||= "Vitalerte".freeze

after_initialize do
  
  Topic.register_custom_field_type('pkADV', :string)
  Topic.register_custom_field_type('nomADV', :string)
  Topic.register_custom_field_type('pkCDA', :string)
  Topic.register_custom_field_type('nomCDA', :string)
  Topic.register_custom_field_type('pkDR', :string)
  Topic.register_custom_field_type('nomDR', :string)
  Topic.register_custom_field_type('pkAgence', :string)
  Topic.register_custom_field_type('nomAgence', :string)
  
  module ::DiscourseStatsVitalerte
    class Engine < ::Rails::Engine
      isolate_namespace DiscourseStatsVitalerte
      engine_name PLUGIN_NAME
    end
  end
  
  DiscourseStatsVitalerte::Engine.routes.draw do
    get     "/" => "nagora_stats#getStatNagora"
    get     "/get_people_and_group" => "nagora_stats#get_people_and_group"
    post    "/add_customer" => "nagora_stats#add_customer"
    post    "/add_group" => "nagora_stats#add_group"
    delete  "/delete_people" => "nagora_stats#delete_people"
    delete  "/delete_group" => "nagora_stats#delete_group"
    get     "/get_categories" => "nagora_stats#get_categories"
    post    "/create" => "nagora_stats#create"
    delete  "/delete" => "nagora_stats#delete"
    get     "/admin/plugins/vitalerte" => "admin/plugins#index"
  end
  
  require_dependency "application_controller"
  module ::DiscourseStatsVitalerte
    class VitalerteValueController < ApplicationController
      
      def show
        render json: {_Values: "controller_nagora"}
      end
    end
  end
  
  Discourse::Application.routes.append do
    get "/vitalerte" => "discourse_stats_vitalerte/vitalerte_value#show"
  end
  
  Discourse::Application.routes.append do
    mount ::DiscourseStatsVitalerte::Engine, at: "/dev-stats-nagora"
  end
  
  load File.expand_path('../controller/vitalerte.rb', __FILE__)

  TopicView.add_post_custom_fields_whitelister do |user|
    ["pkADV", "nomADV", "pkCDA", "nomCDA", "pkDR", "nomDR", "pkAgence", "nomAgence"]
  end

  TopicList.preloaded_custom_fields << "pkADV" if TopicList.respond_to? :preloaded_custom_fields
  TopicList.preloaded_custom_fields << "nomADV" if TopicList.respond_to? :preloaded_custom_fields
  TopicList.preloaded_custom_fields << "pkCDA" if TopicList.respond_to? :preloaded_custom_fields
  TopicList.preloaded_custom_fields << "nomCDA" if TopicList.respond_to? :preloaded_custom_fields
  TopicList.preloaded_custom_fields << "pkDR" if TopicList.respond_to? :preloaded_custom_fields
  TopicList.preloaded_custom_fields << "nomDR" if TopicList.respond_to? :preloaded_custom_fields
  TopicList.preloaded_custom_fields << "pkAgence" if TopicList.respond_to? :preloaded_custom_fields
  TopicList.preloaded_custom_fields << "nomAgence" if TopicList.respond_to? :preloaded_custom_fields

  add_permitted_post_create_param('pkADV')
  add_permitted_post_create_param('nomADV')
  add_permitted_post_create_param('pkCDA')
  add_permitted_post_create_param('nomCDA')
  add_permitted_post_create_param('pkDR')
  add_permitted_post_create_param('nomDR')
  add_permitted_post_create_param('pkAgence')
  add_permitted_post_create_param('nomAgence')

  DiscourseEvent.on(:post_created) do |post, opts, user|
    if opts[:pkADV] || opts[:nomADV] || opts[:pkCDA] || opts[:nomCDA]
      post.custom_fields['pkADV'] = opts[:pkADV]
      post.custom_fields['nomADV'] = opts[:nomADV]
      post.custom_fields['pkCDA'] = opts[:pkCDA]
      post.custom_fields['nomCDA'] = opts[:nomCDA]
      post.custom_fields['pkDR'] = opts[:pkDR]
      post.custom_fields['nomDR'] = opts[:nomDR]
      post.custom_fields['pkAgence'] = opts[:pkAgence]
      post.custom_fields['nomAgence'] = opts[:nomAgence]
      post.save_custom_fields(true)

      topic = Topic.find(post.topic_id)
      topic.custom_fields['pkADV'] = opts[:pkADV]
      topic.custom_fields['nomADV'] = opts[:nomADV]
      topic.custom_fields['pkCDA'] = opts[:pkCDA]
      topic.custom_fields['nomCDA'] = opts[:nomCDA]
      topic.custom_fields['pkDR'] = opts[:pkDR]
      topic.custom_fields['nomDR'] = opts[:nomDR]
      topic.custom_fields['pkAgence'] = opts[:pkAgence]
      topic.custom_fields['nomAgence'] = opts[:nomAgence]
      topic.save_custom_fields(true)
    end
  end

  require 'topic'

  class ::Topic

    def pkADV
      pkADV = self.custom_fields["pkADV"]
    end

    def nomADV
      nomADV = self.custom_fields["nomADV"]
    end

    def pkCDA
      pkCDA = self.custom_fields["pkCDA"]
    end

    def nomCDA
      nomCDA = self.custom_fields["nomCDA"]
    end

    def pkDR
      pkDR = self.custom_fields["pkDR"]
    end

    def nomDR
      nomDR = self.custom_fields["nomDR"]
    end

    def pkAgence
      pkAgence = self.custom_fields["pkAgence"]
    end

    def nomAgence
      nomAgence = self.custom_fields["nomAgence"]
    end
  end

  require 'topic_view_serializer'
  class ::TopicViewSerializer
    attributes :pkADV, :nomADV, :pkCDA, :nomCDA, :pkDR, :nomDR, :pkAgence, :nomAgence

    def pkADV
      object.topic.pkADV
    end
    
    def nomADV
      object.topic.nomADV
    end

    def pkCDA
      object.topic.pkCDA
    end

    def nomCDA
      object.topic.nomCDA
    end

    def pkDR
      object.topic.pkDR
    end

    def nomDR
      object.topic.nomDR
    end

    def pkAgence
      object.topic.pkAgence
    end

    def nomAgence
      object.topic.nomAgence
    end
  end

  require 'topic_list_item_serializer'
  class ::TopicListItemSerializer
    attributes :pkADV, :nomADV, :pkCDA, :nomCDA, :pkDR, :nomDR, :pkAgence, :nomAgence

    def pkAdv
      object.pkADV
    end
    
    def nomADV
      object.nomADV
    end

    def pkCDA
      object.pkCDA
    end

    def nomCDA
      object.nomCDA
    end

    def pkDR
      object.pkDR
    end

    def nomDR
      object.nomDR
    end
    
    def pkAgence
      object.pkAgence
    end

    def nomAgence
      object.nomAgence
    end
  end

  add_to_serializer(:post, :pkADV) { post_custom_fields["pkADV"] }
  add_to_serializer(:post, :nomADV) { post_custom_fields["nomADV"] }
  add_to_serializer(:post, :pkCDA) { post_custom_fields["pkCDA"] }
  add_to_serializer(:post, :nomCDA) { post_custom_fields["nomCDA"] }
  add_to_serializer(:post, :pkDR) { post_custom_fields["pkDR"] }
  add_to_serializer(:post, :nomDR) { post_custom_fields["nomDR"] }
  add_to_serializer(:post, :pkAgence) { post_custom_fields["pkAgence"] }
  add_to_serializer(:post, :nomAgence) { post_custom_fields["nomAgence"] }
end